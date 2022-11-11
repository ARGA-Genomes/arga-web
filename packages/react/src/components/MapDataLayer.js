import { uniqueId } from 'lodash'
import { useState, useEffect, useMemo } from 'react'
import {
  LayerGroup,
  LayersControl,
  Polygon,
  Popup,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import { darken } from '@mui/material/styles'
import '../assets/leaflet/leaflet.draw.css'
import MapGridPopup from './MapGridPopup'
import config from './config'
import theme from './theme'

const SERVER_URL_PREFIX = config.solr_uri
const SOLR_GEO_FIELD = 'quad' // 'packedQuad'

// calculate colour "grouping"s from counts
const getColourForCount = (count) => {
  let colour = theme.palette.grids.coloursForCounts[500] // '#045a8d'

  Object.keys(theme.palette.grids.coloursForCounts).every((key) => {
    if (count - 1 < key) {
      colour = theme.palette.grids.coloursForCounts[key]
      return false // escape `every` looping
    }
    return true
  })

  return colour
}

// generate SOLR/WKT polygon string for filtering on popup click
const getSolrBboxPolygon = (bounds) => {
  // POLYGON((153 -28, 154 -28, 154 -27, 153 -27, 153 -28))
  const sw = bounds.getSouthWest().wrap()
  const se = bounds.getSouthEast().wrap()
  const ne = bounds.getNorthEast().wrap()
  const nw = bounds.getNorthWest().wrap()
  return `POLYGON((${sw.lng} ${sw.lat},${se.lng} ${se.lat},${ne.lng} ${ne.lat},${nw.lng} ${nw.lat},${sw.lng} ${sw.lat}))`
}

const getHeatmapFeatures = (heatmap) => {
  if (Object.keys(heatmap).length < 1 || !heatmap.counts_ints2D) {
    return []
  }

  const gridArray = heatmap.counts_ints2D // rows then columns
  const lat0 = heatmap.maxY
  const lng0 = heatmap.minX
  const latStep = (heatmap.maxY - heatmap.minY) / heatmap.rows // lng changes
  const lngStep =
    heatmap.maxX > heatmap.minX
      ? (heatmap.maxX - heatmap.minX) / heatmap.columns
      : (180 - heatmap.minX + (heatmap.maxX + 180)) / heatmap.columns // lat changes
  // console.log('cell', lat0, lng0, latStep, lngStep)
  const features = []

  // iterate each row
  gridArray.forEach((row, i) => {
    // heatmap row can be `null` if all column/cell values are zero (to save bandwidth)
    if (row) {
      // iterate each column for the given row
      row.forEach((rowCell, j) => {
        // only draw a cell if the count > 0
        if (rowCell > 0) {
          const latN = lat0 - latStep * i
          const lngN = lng0 + lngStep * j
          // if ()
          const coords = [
            [latN, lngN], // [ -28, 146]
            [latN - latStep, lngN], // [-27, 146],
            [latN - latStep, lngN + lngStep], // [-27, 147],
            [latN, lngN + lngStep], // [-28, 147],
          ]
          // Note this geoJSON structure is no longer used (natively by Leaflet), after code was
          // refactored to draw Leaflet shapes directly (due to not being able to attach click events
          // geoJSON features). The values are pulled from this datastructure and added in JSX below.
          const featureObj = {
            type: 'Feature',
            geometry: {
              type: 'polygon',
              coordinates: [coords],
            },
            properties: {
              count: rowCell,
              color: getColourForCount(rowCell),
              geo: [latN, lngN],
              wkt: `POLYGON((${lngN} ${latN}, ${lngN} ${latN - latStep},${
                lngN + lngStep
              } ${latN - latStep}, ${lngN + lngStep} ${latN},${lngN} ${latN}))`,
            },
          }

          features.push(featureObj)
        }
      })
    }
  })

  return features
}

/**
 * MapDataLayer component
 *
 * @param {*} pageState prop
 * @param {*} fqState prop
 * @returns JSX
 */
function MapDataLayer({
  pageState,
  setPageState,
  setDrawerState,
  fqState,
  setFqState,
  facetFields,
  fillOpacity,
}) {
  const map = useMap()
  // const geoJsonLayerRef = useRef(null)
  const [mapDataState, setMapDataState] = useState({
    bbox: map.getBounds(), // Leaflet `LatLngBounds` object
    zoom: map.getZoom(), // 18 is maxZoomLevel, default seems to be 4 or 5 on load
    center: map.getCenter(), // Leaflet `LatLng` object
    data: [],
    heatmap: {},
    isLoading: false,
    errorMsg: '',
  })

  const updateMapState = (mapEv) => {
    setMapDataState((old) => ({
      ...old,
      zoom: mapEv.getZoom(),
      bbox: mapEv.getBounds(),
      center: mapEv.getCenter(),
    }))
  }

  const mapEvent = useMapEvents({
    zoomend: () => {
      updateMapState(mapEvent)
    },
    moveend: () => {
      updateMapState(mapEvent)
    },
  })

  const setLayerStyles = (setColour) => ({
    color: darken(setColour, 0.2),
    fillColor: setColour,
    fillOpacity, // 0.5
    weight: fillOpacity,
    stroke: true,
  })

  /**
   * Empiraclly determin a "grid level" value to send to SOLR for heatmap generation.
   * `gridLevel` must be > 0 and <= 26
   * Based on code in biocache-service:
   * https://github.com/AtlasOfLivingAustralia/biocache-service/blob/develop/src/main/java/au/org/ala/biocache/dao/SearchDAOImpl.java#L2695
   *
   * @returns gridlevel value (Number)
   */
  const getGridLevel = () => {
    // taken from biocache-service
    const gridLevelsArray = [
      360, 180, 90, 45, 22.5, 11.25, 5.625, 2.8125, 1.40625, 0.703125,
      0.3515625, 0.17578125, 0.087890625, 0.0439453125, 0.02197265625,
      0.010986328125, 0.0054931640625, 0.00274658203125, 0.001373291015625,
      0.0006866455078125,
    ]
    // We're not actually using tiles but biocache-service does, so kept same var names
    const tileWidth =
      map.getBounds().getNorthEast().lng - map.getBounds().getNorthWest().lng
    const tileHeight =
      map.getBounds().getNorthWest().lat - map.getBounds().getSouthWest().lat
    const tileSizeWidthIndex = gridLevelsArray.filter(
      (it) => tileWidth < it
    ).length
    const tileSizeHeightIndex = gridLevelsArray.filter(
      (it) => tileHeight < it
    ).length
    const adjustFactor = 5 // was 5 (using Math.min()), based on 7 (max allowed) used in biocache-service, except that is for 256px tiles
    return Math.max(tileSizeWidthIndex, tileSizeHeightIndex) + adjustFactor
  }

  useEffect(() => {
    const fetchRecord = async () => {
      // TODO: code is duplicated in Search.js so needs to be shared in util file or done with React-query
      setMapDataState((old) => ({ ...old, isLoading: true }))
      const fqParamList = []
      Object.keys(fqState).forEach((key) => {
        const tag = facetFields[key]?.tag
          ? `{!tag=${facetFields[key].tag}}`
          : ''
        if (fqState[key].length > 0) {
          fqParamList.push(
            `${tag}${key}:%22${fqState[key].join(`%22+OR+${key}:%22`)}%22`
          )
        } else {
          // empty value in object ()
          fqParamList.push(key)
        }
      })
      const resp = await fetch(
        `${SERVER_URL_PREFIX}/select?q=${
          pageState.q || '*:*'
        }&fq=${fqParamList.join(
          '&fq='
        )}&facet=true&facet.heatmap=${SOLR_GEO_FIELD}&facet.heatmap.geom=${getSolrBboxPolygon(
          mapDataState.bbox
        )}&facet.heatmap.gridLevel=${getGridLevel()}&facet.mincount=1&rows=0&facet.limit=9999`
      )
      const json = await resp.json()
      setMapDataState((old) => ({
        ...old,
        isLoading: false,
        heatmap: json.facet_counts.facet_heatmaps[SOLR_GEO_FIELD],
      }))
    }
    fetchRecord().catch((error) => {
      setMapDataState((old) => ({
        ...old,
        isLoading: false,
        errorMsg: error.message,
      }))
      // const msg = `Oops something went wrong. ${error.message}`
      // setSnackState({ status: true, message: msg })
      // console.log('API error', error.message)
    })
  }, [mapDataState.bbox, mapDataState.zoom, pageState.q, fqState])

  // I have a feeling the useMemo is unceccessary in its cirrent form
  // `getHeatmapFeatures` could be called inside useEffect, probably?
  const heatmapFeatures = useMemo(
    () => getHeatmapFeatures(mapDataState.heatmap),
    [mapDataState.heatmap]
  )

  return (
    <LayersControl.Overlay checked name="Sequence heatmap">
      {heatmapFeatures.length > 0 && (
        <LayerGroup pane="dataPane">
          {heatmapFeatures.map((feature) => (
            <Polygon
              key={uniqueId('heatmap')}
              pathOptions={setLayerStyles(feature.properties.color)}
              positions={feature.geometry.coordinates}
            >
              <Popup pane="popupPane">
                <MapGridPopup
                  feature={feature}
                  pageState={pageState}
                  setPageState={setPageState}
                  setDrawerState={setDrawerState}
                  fqState={fqState}
                  setFqState={setFqState}
                />
              </Popup>
            </Polygon>
          ))}
        </LayerGroup>
      )}
    </LayersControl.Overlay>
  )
}

export default MapDataLayer

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
import MapGridPopup from './MapGridPopup'

const serverUrlPrefix = 'https://nectar-arga-dev-1.ala.org.au/api'
const solrGeoField = 'quad' // 'packedQuad'

// Colour palette from https://colorbrewer2.org/#type=sequential&scheme=PuBu&n=5
// Note this code is duplicated in MapLegend - ideally it should be passed in as a prop
// but this makes it require react.memo or similar. Could be done with context too.
const coloursForCounts = {
  10: '#f1eef6',
  50: '#bdc9e1',
  100: '#74a9cf',
  250: '#2b8cbe',
  500: '#045a8d',
}

const zoomToPoint = {
  1: 'point-1',
  2: 'point-1',
  3: 'point-1',
  4: 'point-1',
  5: 'point-1',
  6: 'point-1',
  7: 'point-0.1',
  8: 'point-0.1',
  9: 'point-0.1',
  10: 'point-0.01',
  11: 'point-0.01',
  12: 'point-0.01', // everything higher is `0.001`
}

const getColourForCount = (count) => {
  let colour = '#045a8d'

  Object.keys(coloursForCounts).every((key) => {
    if (count - 1 < key) {
      colour = coloursForCounts[key]
      return false // escape `every` looping
    }
    return true
  })

  return colour
}

const getFieldForZoom = (zoom) => {
  // let field = 'location' // not a facet field!
  let field = 'point-0.001'
  if (zoom in zoomToPoint) {
    field = zoomToPoint[zoom]
  }
  return field
}

function getGeoAddition(lat, lng) {
  if (!lat.includes('.') && !lng.includes('.')) {
    return 1
  }

  const decimalLat = lat.includes('.') ? lat.split('.')[1].length : 1
  const decimalng = lng.includes('.') ? lng.split('.')[1].length : 1
  const decimal = Math.min(decimalLat, decimalng)
  const stringPart = `.${'0'.repeat(decimal - 1)}`
  return Number(stringPart + 1)
}

function getPrecisionFromGeoField(geoField) {
  // point-1, point-0.1, point-0.01, point-0.001, point-0.0001
  let precision = 1
  const numberPart = geoField.substring(6) // point-0.1 -> 0.1

  if (!Number.isNaN(numberPart)) {
    precision = Number(numberPart)
  }

  return precision
}

const getFeatureObj = ({ latlng, count, geoField }) => {
  const [lat, lng] = latlng.split(',') // array of strings !
  const geoFieldAddition = getPrecisionFromGeoField(geoField)
  const geoDataAddition = getGeoAddition(lat, lng, geoField)
  const geoAddition = Math.min(geoFieldAddition, geoDataAddition)
  const latN = Number(lat)
  const lngN = Number(lng)
  let type = 'Polygon'
  let coords = []

  if (geoField.startsWith('point')) {
    // geoJSON is x, y format
    // coords = [
    //   [lngN, latN], // [146, -28]
    //   [lngN, latN + geoAddition], // [146, -27],
    //   [lngN + geoAddition, latN + geoAddition], // [147, -27],
    //   [lngN + geoAddition, latN], // [147, -28],
    //   [lngN, latN], // [146, -28]
    // ]
    // Leaflet is lat,lng format
    coords = [
      [latN, lngN], // [ -28, 146]
      [latN + geoAddition, lngN], // [-27, 146],
      [latN + geoAddition, lngN + geoAddition], // [-27, 147],
      [latN, lngN + geoAddition], // [-28, 147],
      // [latN, lngN], // [-28, 146] - we don't need to close it with Leaflet polygon (unlike WKT and geoJSON)
    ]
  } else {
    type = 'Point'
    coords = [lngN, latN]
  }

  const featureObj = {
    type: 'Feature',
    geometry: {
      type, // shorthand
      coordinates: [coords],
    },
    properties: {
      count,
      color: getColourForCount(count),
      geoAddition,
      latlng,
      geoField,
    },
  }
  // console.log('featureObj', featureObj)
  return featureObj
}

const buildPolygonArray = (data, geoField) => {
  // data is array of lat,lng and count couplets
  // console.log('data, geoField', data, geoField)
  const featureArray = []
  for (let i = 0; i < data.length; i += 2) {
    const latlng = data[i]
    const count = data[i + 1]
    featureArray.push(getFeatureObj({ latlng, count, geoField }))
  }
  // console.log('featureArray', featureArray)

  // const geoJsonObj = {
  //   type: 'FeatureCollection',
  //   features: featureArray,
  // }

  return featureArray
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
  setRecordState,
}) {
  const map = useMap()
  // const geoJsonLayerRef = useRef(null)
  const [mapDataState, setMapDataState] = useState({
    bbox: map.getBounds(), // Leaflet `LatLngBounds` object
    zoom: map.getZoom(), // 18 is maxZoomLevel, default seems to be 4 or 5 on load
    center: map.getCenter(), // Leaflet `LatLng` object
    geoField: getFieldForZoom(map.getZoom()),
    data: [],
    heatmap: {},
    crossesDateline: false,
    isLoading: false,
    errorMsg: '',
  })

  const updateMapState = (mapEv) => {
    setMapDataState((old) => ({
      ...old,
      zoom: mapEv.getZoom(),
      bbox: mapEv.getBounds(),
      center: mapEv.getCenter(),
      geoField: getFieldForZoom(mapEv.getZoom()),
    }))
  }

  const setLayerStyles = (setColour) => ({
    color: darken(setColour, 0.2),
    fillColor: setColour,
    fillOpacity: 0.6,
    weight: 1,
    stroke: true,
  })

  const mapEvent = useMapEvents({
    zoomend: () => {
      updateMapState(mapEvent)
    },
    moveend: () => {
      updateMapState(mapEvent)
    },
  })

  const getSolrBboxPolygon = (bounds) => {
    // POLYGON((153 -28, 154 -28, 154 -27, 153 -27, 153 -28))
    const sw = bounds.getSouthWest().wrap()
    const se = bounds.getSouthEast().wrap()
    const ne = bounds.getNorthEast().wrap()
    const nw = bounds.getNorthWest().wrap()
    // console.log(
    //   'bbox',
    //   bounds.toBBoxString(),
    //   bounds.getNorthEast().wrap(),
    //   bounds.getNorthEast()
    // )
    let wktString = ''
    if (true && bounds.getNorthEast().lng > 180) {
      // bbox crosses dateline
      setMapDataState((old) => ({ ...old, crossesDateline: true }))
      wktString = `MULTIPOLYGON(((${nw.lng} ${nw.lat},${sw.lng} ${sw.lat},180 ${se.lat},180 ${ne.lat},${nw.lng} ${nw.lat})),((-180 ${se.lat}, ${se.lng} ${se.lat}, ${ne.lng} ${ne.lat}, -180 ${ne.lat}, -180 ${se.lat})))`
    } else {
      wktString = `POLYGON((${sw.lng} ${sw.lat},${se.lng} ${se.lat},${ne.lng} ${ne.lat},${nw.lng} ${nw.lat},${sw.lng} ${sw.lat}))`
    }
    return wktString

    // const wrappedSw = bounds.getSouthWest().wrap()
    // const wrappedNe = bounds.getNorthEast().wrap()
    // return `["${wrappedSw.lng} ${bounds.getSouth()}" TO "${
    //   wrappedNe.lng
    // } ${bounds.getNorth()}"]`
  }

  // const getSolrBboxFq = (bounds) => {
  //   const wrappedSw = bounds.getSouthWest().wrap()
  //   const wrappedNe = bounds.getNorthEast().wrap()
  //   return `"Intersects(ENVELOPE(${wrappedSw.lng}, ${
  //     wrappedNe.lng
  //   }, ${bounds.getNorth()}, ${bounds.getSouth()}))"`
  // }

  const getGridLevel = () => {
    // Code from https://github.com/AtlasOfLivingAustralia/biocache-service/blob/develop/src/main/java/au/org/ala/biocache/dao/SearchDAOImpl.java#L2695
    const gridLevelsArray = [
      360, 180, 90, 45, 22.5, 11.25, 5.625, 2.8125, 1.40625, 0.703125,
      0.3515625, 0.17578125, 0.087890625, 0.0439453125, 0.02197265625,
      0.010986328125, 0.0054931640625, 0.00274658203125, 0.001373291015625,
      0.0006866455078125,
    ]
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
    const adjustFactor = 5 // simlar to 7 used in biocache-service, except that is for 256px tiles
    // console.log('getGridLevel tile size', tileWidth, tileHeight)
    // console.log('getGridLevel index', tileSizeWidthIndex, tileSizeHeightIndex)
    // gridLevel must be > 0 and <= 26

    return Math.min(tileSizeWidthIndex, tileSizeHeightIndex) + adjustFactor
  }

  useEffect(() => {
    const fetchRecord = async () => {
      // TODO code is duplicated in Search.js so needs to be shared in util file or done with React-query
      setMapDataState((old) => ({ ...old, isLoading: true }))
      const fqParamList = []
      Object.keys(fqState).forEach((key) => {
        if (fqState[key].length > 0) {
          fqState[key].forEach((val) => {
            fqParamList.push(`${key}:%22${val}%22`)
          })
        } else {
          // empty value in object ()
          fqParamList.push(key)
        }
      })
      const resp = await fetch(
        `${serverUrlPrefix}/select?q=${
          pageState.q || '*:*'
        }&fq=${fqParamList.join('&fq=')}&facet=true&facet.field=${
          mapDataState.geoField
        }&facet.heatmap=${solrGeoField}&facet.heatmap.geom=${getSolrBboxPolygon(
          mapDataState.bbox
        )}&facet.heatmap.gridLevel=${getGridLevel()}&facet.mincount=1&rows=0&facet.limit=9999`
      )
      const json = await resp.json()
      setMapDataState((old) => ({
        ...old,
        isLoading: false,
        data: buildPolygonArray(
          json.facet_counts.facet_fields[mapDataState.geoField],
          mapDataState.geoField
        ),
        heatmap: json.facet_counts.facet_heatmaps[solrGeoField],
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

  const getHeatmapPolygons = (heatmap) => {
    if (Object.keys(heatmap).length < 1 || heatmap.counts_ints2D.length < 1) {
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
                } ${latN - latStep}, ${
                  lngN + lngStep
                } ${latN},${lngN} ${latN}))`,
              },
            }

            if (lngN > 180) {
              // console.log('featureObj', featureObj)
            }
            features.push(featureObj)
          }
        })
      }
    })

    return features
  }

  const heatmapFeatures = useMemo(
    () => getHeatmapPolygons(mapDataState.heatmap),
    [mapDataState.heatmap]
  )

  return (
    <>
      <LayersControl.BaseLayer name="Sequence data">
        <LayerGroup>
          {mapDataState.data.map((feature) => (
            <Polygon
              key={uniqueId()}
              pathOptions={setLayerStyles(feature.properties.color)}
              positions={feature.geometry.coordinates}
            >
              <Popup>
                <MapGridPopup
                  feature={feature}
                  pageState={pageState}
                  setPageState={setPageState}
                  setDrawerState={setDrawerState}
                  fqState={fqState}
                  setFqState={setFqState}
                  setRecordState={setRecordState}
                />
              </Popup>
            </Polygon>
          ))}
        </LayerGroup>
      </LayersControl.BaseLayer>
      {heatmapFeatures.length > 0 && (
        <LayersControl.BaseLayer checked name="Sequence heatmap">
          <LayerGroup>
            {heatmapFeatures.map((feature) => (
              <Polygon
                key={uniqueId('heatmap')}
                pathOptions={setLayerStyles(feature.properties.color)}
                positions={feature.geometry.coordinates}
              >
                <Popup>
                  <MapGridPopup
                    feature={feature}
                    pageState={pageState}
                    setPageState={setPageState}
                    setDrawerState={setDrawerState}
                    fqState={fqState}
                    setFqState={setFqState}
                    setRecordState={setRecordState}
                  />
                </Popup>
              </Polygon>
            ))}
          </LayerGroup>
        </LayersControl.BaseLayer>
      )}
    </>
  )
}

export default MapDataLayer

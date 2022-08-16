import { useState, useEffect, useRef } from 'react'
import ReactDOMServer from 'react-dom/server'
// import { Button } from '@mui/material'
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  useMap,
  useMapEvents,
  LayersControl,
} from 'react-leaflet'
import { darken } from '@mui/material/styles'
import '../assets/leaflet/leaflet.css'
import Legend from './MapLegend'
import MapPopup from './MapPopup'

// import { Icon } from 'leaflet'
// import { CssBaseline } from '@mui/material'

const serverUrlPrefix = 'https://nectar-arga-dev-1.ala.org.au/api'
const AusBounds = [
  [-43, 113],
  [-11, 154],
]

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

// Colour palette from https://colorbrewer2.org/#type=sequential&scheme=PuBu&n=5
const coloursForCounts = {
  10: '#f1eef6',
  50: '#bdc9e1',
  100: '#74a9cf',
  250: '#2b8cbe',
  500: '#045a8d',
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

// function Popup({ feature }) {
//   let popupContent = '-1'
//   if (feature.properties && feature.properties.count) {
//     popupContent = feature.properties.count
//   }
//   // feature.geometry.coordinates

//   return (
//     <div>
//       {popupContent} sequence records
//       <br />
//       <a href="#">View sequences for this area</a>
//     </div>
//   )
// }

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
    coords = [
      [lngN, latN], // [146, -28]
      [lngN, latN + geoAddition], // [146, -27],
      [lngN + geoAddition, latN + geoAddition], // [147, -27],
      [lngN + geoAddition, latN], // [147, -28],
      [lngN, latN], // [146, -28]
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
    },
  }
  // console.log('featureObj', featureObj)
  return featureObj
}

const geoJsonFromSolr = (data, geoField) => {
  // data is array of lat,lng and count couplets
  const featureArray = []
  for (let i = 0; i < data.length; i += 2) {
    const latlng = data[i]
    const count = data[i + 1]
    featureArray.push(getFeatureObj({ latlng, count, geoField }))
  }
  // console.log('geoJsonFromSolr', featureArray)

  const geoJsonObj = {
    type: 'FeatureCollection',
    features: featureArray,
  }

  return geoJsonObj
}

function CustomGeoJson({ pageState, fqState }) {
  const map = useMap()
  const geoJsonLayerRef = useRef(null)
  const [mapDataState, setMapDataState] = useState({
    bbox: map.getBounds(), // Leaflet `LatLng` object
    zoom: map.getZoom(), // 18 is maxZoomLevel, default seems to be 4 or 5 on load
    center: map.getCenter(), // Leaflet `LatLng` object
    geoField: getFieldForZoom(map.getZoom()),
    data: null,
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

  // Add styling and popup to each polygon
  const onEachPolygon = (feature, layer) => {
    const setColor = feature.properties.color
    if (setColor) {
      layer.setStyle({
        color: darken(setColor, 0.2),
        fillColor: setColor,
        fillOpacity: 0.6,
        weight: 1,
        stroke: true,
      })
    }
    const popupContent = ReactDOMServer.renderToString(
      // Note this is effectively doing a static HTML output, similar to SSR,
      // so interactive functionality (like data fetching) does not work.
      // See https://stackoverflow.com/a/67474278/249327 alternative way...
      <MapPopup feature={feature} pageState={pageState} fqState={fqState} />
    )
    layer.bindPopup(popupContent)
  }

  const mapEvent = useMapEvents({
    zoomend: () => {
      updateMapState(mapEvent)
    },
    moveend: () => {
      updateMapState(mapEvent)
    },
  })

  const getSolrBbox = (latLngBounds, center) => {
    // Calculate distance from map center to a corner for use as radius value (km)
    // in SOLR bbox filter https://solr.apache.org/guide/8_5/spatial-search.html#bbox
    const dist = center.distanceTo(latLngBounds.getNorthEast()) / 1000
    return `${center.lat.toFixed(7)},${center.lng.toFixed(7)}&d=${Math.ceil(
      dist
    )}`
  }

  useEffect(() => {
    // console.log(
    //   'map',
    //   // mapDataState.zoom,
    //   // mapDataState.bbox,
    //   pageState.q
    // )
    const fetchRecord = async () => {
      setMapDataState((old) => ({ ...old, isLoading: true }))
      const fqParamList = []
      Object.keys(fqState).forEach((key) => {
        if (fqState[key].length > 0) {
          fqState[key].forEach((val) => {
            fqParamList.push(`${key}:%22${val}%22`)
          })
        }
      })
      const resp = await fetch(
        `${serverUrlPrefix}/select?q=${
          pageState.q || '*:*'
        }&fq=${fqParamList.join(
          '&fq='
        )}&fq={!bbox%20sfield=location}&pt=${getSolrBbox(
          mapDataState.bbox,
          mapDataState.center
        )}&facet=true&facet.field=${
          mapDataState.geoField
        }&facet.mincount=1&rows=0&facet.limit=4999`
      )
      const json = await resp.json()
      setMapDataState((old) => ({
        ...old,
        isLoading: false,
        data: geoJsonFromSolr(
          json.facet_counts.facet_fields[mapDataState.geoField],
          mapDataState.geoField
        ),
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
    })
  }, [mapDataState.bbox, mapDataState.zoom, pageState.q, fqState])

  useEffect(() => {
    if (
      mapDataState.data &&
      geoJsonLayerRef.current &&
      geoJsonLayerRef.current.getLayers()
    ) {
      // console.log('adding data: ', mapDataState.data)
      geoJsonLayerRef.current.clearLayers().addData(mapDataState.data)
    }
  }, [mapDataState.data])

  return (
    <GeoJSON
      key={mapDataState.data ? mapDataState.data.length : 1}
      ref={geoJsonLayerRef}
      attribution="CC-BY ARGA"
      data={mapDataState.data}
      onEachFeature={onEachPolygon}
    />
  )
}

function MapView({ pageState, fqState }) {
  return (
    <MapContainer
      bounds={AusBounds}
      scrollWheelZoom={false}
      style={{ height: 'calc(100vh - 284px)', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        maxZoom={20}
        subdomains="abcd"
      />
      <LayersControl position="topright">
        <LayersControl.Overlay checked name="Sequence data">
          <CustomGeoJson pageState={pageState} fqState={fqState} />
        </LayersControl.Overlay>
      </LayersControl>
      <Legend coloursForCounts={coloursForCounts} />
    </MapContainer>
  )
}
export default MapView

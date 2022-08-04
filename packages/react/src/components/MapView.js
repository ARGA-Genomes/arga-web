import { useState, useEffect, useRef } from 'react'
import ReactDOMServer from 'react-dom/server'
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import '../assets/leaflet/leaflet.css'
// import GeosjonData from '../assets/leaflet/example-featurecollection.json'

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
  12: 'point-0.01',
  // 13: 'point-0.001',
  // 14: 'point-0.001',
  // 15: 'point-0.001',
  // 16: 'point-0.001',
}

const getColourForCount = (count) => {
  let colour = '#cc0000'

  if (count < 10) {
    colour = '#ffff00'
  } else if (count < 50) {
    colour = '#ffcc00'
  } else if (count < 100) {
    colour = '#ff9900'
  } else if (count < 250) {
    colour = '#ff6600'
  } else if (count < 500) {
    colour = '#ff3300'
  }

  return colour
}

const getFieldForZoom = (zoom) => {
  // let field = 'location'
  let field = 'point-0.001'
  if (zoom in zoomToPoint) {
    field = zoomToPoint[zoom]
  }
  return field
}

function Popup({ feature }) {
  let popupContent = '-1'
  let latLngs = null
  let precision = ''
  if (feature.properties && feature.properties.count) {
    popupContent = feature.properties.count
    precision = feature.properties.geoAddition
    latLngs = feature.geometry.coordinates.join(',')
  }

  return (
    <div>
      {popupContent} sequence records ({precision}) - {latLngs}
    </div>
  )
}

const onEachPolygon = (feature, layer) => {
  const setColor = feature.properties.color
  if (setColor) {
    layer.setStyle({
      color: setColor,
      fillColor: setColor,
      fillOpacity: 0.4,
      weight: 1,
      strole: false,
    })
  }
  const popupContent = ReactDOMServer.renderToString(
    <Popup feature={feature} />
  )
  layer.bindPopup(popupContent)
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
  console.log('featureObj', featureObj)
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
  console.log('geoJsonFromSolr', featureArray)

  const geoJsonObj = {
    type: 'FeatureCollection',
    features: featureArray,
  }

  return geoJsonObj
}

function CustomGeoJson() {
  const map = useMap()
  const geoJsonLayerRef = useRef(null)
  const [mapDataState, setMapDataState] = useState({
    bbox: map.getBounds(),
    zoom: map.getZoom(), // 18 is maxZoomLevel, default seems to be 4 or 5 on load
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
      geoField: getFieldForZoom(mapEv.getZoom()),
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

  const getSolrBbox = (latLngBounds) =>
    `[${latLngBounds.getSouthWest().lat},${
      latLngBounds.getSouthWest().lng
    }%20TO%20${latLngBounds.getNorthEast().lat},${
      latLngBounds.getNorthEast().lng
    }]`

  useEffect(() => {
    console.log('map', mapDataState.zoom, mapDataState.bbox)
    const fetchRecord = async () => {
      setMapDataState((old) => ({ ...old, isLoading: true }))
      const resp = await fetch(
        `${serverUrlPrefix}/select?q=*:*&fq=geohash:${getSolrBbox(
          mapDataState.bbox
        )}&facet=true&facet.field=${
          mapDataState.geoField
        }&facet.mincount=1&rows=0&facet.limit=999`
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
  }, [mapDataState.bbox, mapDataState.zoom])

  useEffect(() => {
    if (
      mapDataState.data &&
      geoJsonLayerRef.current &&
      geoJsonLayerRef.current.getLayers()
    ) {
      console.log('adding data: ', mapDataState.data)
      geoJsonLayerRef.current.clearLayers().addData(mapDataState.data)
    }
  }, [mapDataState.data])

  return (
    <GeoJSON
      key={mapDataState.data ? mapDataState.data.length : 1}
      ref={geoJsonLayerRef}
      attribution="CC-BY ARGA"
      // data={GeosjonData}
      data={mapDataState.data}
      onEachFeature={onEachPolygon}
    />
  )
}

function MapView() {
  // const map = useMap()

  return (
    <MapContainer
      // center={[-25.61, 134.36]}
      // zoom={5}
      bounds={AusBounds}
      scrollWheelZoom={false}
      style={{ height: 'calc(100vh - 284px)', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <CustomGeoJson />
    </MapContainer>
  )
}
export default MapView

import { MapContainer, TileLayer, LayersControl } from 'react-leaflet'
import Legend from './MapLegend'
import MapDataLayer from './MapDataLayer'
import '../assets/leaflet/leaflet.css'

const AusBounds = [
  [-43, 113],
  [-11, 154],
]

function MapView({
  pageState,
  setPageState,
  setDrawerState,
  fqState,
  setFqState,
  setRecordState,
}) {
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
        worldCopyJump={1}
      />
      <LayersControl position="topright">
        <MapDataLayer
          pageState={pageState}
          setPageState={setPageState}
          setDrawerState={setDrawerState}
          fqState={fqState}
          setFqState={setFqState}
          setRecordState={setRecordState}
        />
      </LayersControl>
      <Legend />
    </MapContainer>
  )
}
export default MapView

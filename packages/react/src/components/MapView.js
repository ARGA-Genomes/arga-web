import { MapContainer, TileLayer, LayersControl } from 'react-leaflet'
import '../assets/leaflet/leaflet.css'
import Legend from './MapLegend'
import MapDataLayer from './MapDataLayer'

// import { Icon } from 'leaflet'
// import { CssBaseline } from '@mui/material'

const AusBounds = [
  [-43, 113],
  [-11, 154],
]

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
          <MapDataLayer pageState={pageState} fqState={fqState} />
        </LayersControl.Overlay>
      </LayersControl>
      <Legend />
    </MapContainer>
  )
}
export default MapView

import { MapContainer, TileLayer, LayersControl, Pane } from 'react-leaflet'
import Legend from './MapLegend'
import MapDataLayer from './MapDataLayer'
import '../assets/leaflet/leaflet.css'
import MapDrawTool from './MapDrawTool'

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
  facetFields,
}) {
  return (
    <MapContainer
      bounds={AusBounds}
      scrollWheelZoom={false}
      style={{ height: 'calc(100vh - 330px)', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        maxZoom={20}
        subdomains="abcd"
        worldCopyJump={1}
      />
      <LayersControl position="topright">
        <Pane name="dataPane" style={{ zIndex: 301 }}>
          <MapDataLayer
            pageState={pageState}
            setPageState={setPageState}
            setDrawerState={setDrawerState}
            fqState={fqState}
            setFqState={setFqState}
            setRecordState={setRecordState}
            facetFields={facetFields}
          />
        </Pane>
      </LayersControl>
      <Legend />
      <MapDrawTool fqState={fqState} setFqState={setFqState} />
    </MapContainer>
  )
}
export default MapView

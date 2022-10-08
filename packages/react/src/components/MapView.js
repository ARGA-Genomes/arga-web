import { useState } from 'react'
import { MapContainer, TileLayer, LayersControl, Pane } from 'react-leaflet'
import Legend from './MapLegend'
import MapDataLayer from './MapDataLayer'
import '../assets/leaflet/leaflet.css'
import MapDrawTool from './MapDrawTool'
import MapOpacitySlider from './MapOpacitySlider'

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
  // state for opacity slider, used in 2 child components
  const [fillOpacity, setFillOpacity] = useState(0.5)

  return (
    <>
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
              fillOpacity={fillOpacity}
            />
          </Pane>
        </LayersControl>
        <Legend fillOpacity={fillOpacity} />
        <MapDrawTool fqState={fqState} setFqState={setFqState} />
      </MapContainer>
      <MapOpacitySlider
        fillOpacity={fillOpacity}
        setFillOpacity={setFillOpacity}
      />
    </>
  )
}
export default MapView

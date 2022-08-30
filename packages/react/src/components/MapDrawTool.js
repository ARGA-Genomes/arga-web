import React, { useState, useRef } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import { Button } from '@mui/material'
import { useMap, FeatureGroup, Popup } from 'react-leaflet'
import { EditControl } from 'react-leaflet-draw'
import '../assets/leaflet/leaflet.draw.css'

function MapDrawTool({ setFqState }) {
  const [drawLayer, setDrawLayer] = useState({ layer: null, layerType: '' })
  const drawToolRef = useRef()
  const popupRef = useRef() // not sure this needed but provides a check to `map.closePopoup()`
  const map = useMap()
  const styles = {
    button: {
      textTransform: 'none',
      margin: '6px 0',
    },
  }
  const solrGeoField = 'geohash' // 'packedQuad' 'location' other values

  // keep a reference to `drawLayer` so that `onFilterRecords` callback can see updates to `drawLayer`
  drawToolRef.current = drawLayer

  const onCreated = (e) => {
    if (drawToolRef.current.layer) {
      // only allow one layer to exist at a time
      map.removeLayer(drawToolRef.current.layer)
      map.closePopup() // don't leave orphaned popups open on deleted layers
    }

    setDrawLayer({ layer: e.layer, layerType: e.layerType })
    e.layer.bindTooltip('Click shape to see options')
    e.layer.bringToFront() // so grid polygon onClick events aren't triggered
    map.addLayer(e.layer)
  }

  const onDeleted = (e) => {
    const layerToDelete =
      e.layer || drawToolRef.current?.layer || drawLayer.layer
    map.removeLayer(layerToDelete)
    if (popupRef.current) {
      map.closePopup()
    }
    setDrawLayer({ layer: null, layerType: '' })
  }

  const onFilterRecords = (e) => {
    e.stopPropagation()
    e.preventDefault()
    const theLayer = drawToolRef.current.layer
    let fqField = ''

    if (drawToolRef.current.layerType === 'circle') {
      // &fq={!geofilt sfield=store}&pt=45.15,-93.85&d=5
      const latLng = theLayer.getLatLng()
      const rad = Math.round(theLayer.getRadius() / 1000) // m to km
      fqField = `{!geofilt sfield=location}&pt=${latLng.lat.toFixed(
        6
      )},${latLng.lng.toFixed(6)}&d=${rad}`
    } else {
      const latLngs = theLayer.getLatLngs()
      const wktArray = latLngs[0].map(
        (it) => `${it.lng.toFixed(6)} ${it.lat.toFixed(6)}`
      )
      const wktString = `${wktArray.reverse().join(',')},${wktArray[0]}` // SOLR expects CCW WKT string and needs to be a "closed" shape
      fqField = `{!field f=${solrGeoField}}Intersects(POLYGON((${wktString})))`
    }

    const fq = { [fqField]: '' }
    setFqState((old) => ({ ...old, ...fq })) // triggers SOLR request
  }

  return (
    <FeatureGroup>
      <EditControl
        position="topleft"
        onCreated={onCreated}
        onDeleted={onDeleted}
        edit={{ edit: false }}
        draw={{
          polyline: false,
          marker: false,
          circlemarker: false,
        }}
      />
      <Popup ref={popupRef}>
        <Button
          sx={styles.button}
          size="small"
          variant="contained"
          color="primary"
          startIcon={<SearchIcon />}
          onClick={onFilterRecords}
        >
          Filter results for this area
        </Button>
        <Button
          sx={styles.button}
          size="small"
          variant="outlined"
          color="primary"
          startIcon={<DeleteForeverIcon />}
          onClick={onDeleted}
        >
          Remove this shape
        </Button>
      </Popup>
    </FeatureGroup>
  )
}

export default React.memo(MapDrawTool)

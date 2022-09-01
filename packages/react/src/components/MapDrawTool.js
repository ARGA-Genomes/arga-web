import React, { useState, useRef } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import { Box, Button, Typography } from '@mui/material'
import { useMap, FeatureGroup, Popup } from 'react-leaflet'
import { EditControl } from 'react-leaflet-draw'
import '../assets/leaflet/leaflet.draw.css'

function MapDrawTool({ setFqState }) {
  const [drawLayer, setDrawLayer] = useState({ layer: null, layerType: '' })
  // keep a reference to `drawLayer` so that `onFilterRecords` callback can see updates to `drawLayer`
  const drawToolRef = useRef()
  drawToolRef.current = drawLayer
  // not sure this needed but provides a check to `map.closePopoup()`
  const popupRef = useRef()
  const map = useMap()

  // CSS styles
  const styles = {
    button: {
      textTransform: 'none',
      margin: '6px 0',
    },
    typography: {
      margin: '0  !important',
      padding: 0,
      fontSize: '13px',
      fontWeight: 500,
    },
  }
  const solrGeoField = 'geohash' // 'packedQuad' 'location' other values

  const onCreated = (e) => {
    if (drawToolRef.current.layer) {
      // only allow one layer to exist at a time
      map.removeLayer(drawToolRef.current.layer)
      map.closePopup() // don't leave orphaned popups open on deleted layers
    }

    setDrawLayer({ layer: e.layer, layerType: e.layerType })
    e.layer.bindTooltip('Click shape to see options')
    // e.layer.bringToFront() // so grid polygon onClick events aren't triggered
    map.addLayer(e.layer)
  }

  const onDeleted = (e) => {
    const layerToDelete =
      drawToolRef.current?.layer || drawLayer.layer || (e.layers && e.layers[0])
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
      // SOLR expects a CCW WKT string (reverse it) and needs to be a "closed" shape (add additional closing point)
      const wktString = `${wktArray.reverse().join(',')},${wktArray[0]}`
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
        // onEdited={onEdited}
        // edit={{ edit: false }}
        draw={{
          polyline: false,
          marker: false,
          circlemarker: false,
        }}
      />
      <Popup ref={popupRef}>
        <Box sx={{ textAlign: 'center' }}>
          <Button
            sx={styles.button}
            size="small"
            variant="contained"
            color="primary"
            startIcon={<SearchIcon />}
            onClick={onFilterRecords}
          >
            <Typography noWrap sx={styles.typography}>
              Filter results for this area
            </Typography>
          </Button>
          <Button
            sx={styles.button}
            size="small"
            variant="outlined"
            color="primary"
            startIcon={<DeleteForeverIcon />}
            onClick={onDeleted}
          >
            <Typography noWrap sx={styles.typography}>
              Remove this shape
            </Typography>
          </Button>
        </Box>
      </Popup>
    </FeatureGroup>
  )
}

export default React.memo(MapDrawTool)

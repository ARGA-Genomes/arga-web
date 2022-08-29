import { useRef } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import { Button } from '@mui/material'
import { useMap, FeatureGroup, Popup } from 'react-leaflet'
import { EditControl } from 'react-leaflet-draw'
import '../assets/leaflet/leaflet.draw.css'

const solrGeoField = 'quad' // 'packedQuad'

function MapDrawTool({ setFqState }) {
  const drawToolRef = useRef() // save any drawn shape layers in this `ref` (`useState` doesn't work for this)
  drawToolRef.current = { layer: null, layerType: '' }
  const popupRef = useRef()
  const map = useMap()
  const styles = {
    button: {
      textTransform: 'none',
    },
  }

  const onCreated = (e) => {
    // const type = e.layerType
    console.log(
      'onCreated | layer:',
      drawToolRef.current.layer,
      'layerType:',
      drawToolRef.current.layerType
    )
    console.log('onCreated 2', e.layerType, e.layer)

    if (drawToolRef.current.layer) {
      // only allow one layer to exist at a time
      map.removeLayer(drawToolRef.current.layer)
      map.closePopup()
    }
    drawToolRef.current = { layer: e.layer, layerType: e.layerType }
    e.layer.bindTooltip('Click shape to see options')
    e.layer.bringToFront() // so grid polygon onClick events aren't triggered
    map.addLayer(e.layer)
  }

  const onDeleted = (e) => {
    // setDrawToolState({ layer: null, layerType: '' })
    console.log('onDeleted', e)
    map.removeLayer(drawToolRef.current.layer)
    if (popupRef.current) {
      console.log('onDeleted', e)
      map.closePopup()
    }

    drawToolRef.current = { layer: null, layerType: '' }
  }

  const onFilterRecords = (e) => {
    e.stopPropagation()
    e.preventDefault()
    console.log('onFilterRecords clicked', e)
    const layer = drawToolRef.current
    console.log('onFilterRecords layer', layer)
    let wktString = ''
    if (drawToolRef.current.layerType === 'circle') {
      wktString = ``
    }

    const fq = { [solrGeoField]: [wktString] }
    setFqState((old) => ({ ...old, ...fq }))
    setFqState()
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
        <br />
        <br />
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

export default MapDrawTool

import { Box, Slider, Typography } from '@mui/material'
import { useMemo } from 'react'

function valuetext(value) {
  return `${value * 100}%`
}

function MapOpacitySlider({ fillOpacity, setFillOpacity }) {
  const slider = useMemo(
    () => (
      <>
        <Typography>Grid opacity</Typography>
        <Box sx={{ width: 105 }}>
          <Slider
            aria-label="Map data layer opacity slider"
            getAriaValueText={valuetext}
            defaultValue={fillOpacity}
            valueLabelFormat={valuetext}
            step={0.1}
            onChange={(e, val) => setFillOpacity(val)}
            marks
            min={0.1}
            max={0.9}
            valueLabelDisplay="auto"
          />
        </Box>
      </>
    ),
    []
  )

  return (
    <div className="leaflet-bottom leaflet-right slider">
      <div className="leaflet-control">{slider}</div>
    </div>
  )
}

export default MapOpacitySlider

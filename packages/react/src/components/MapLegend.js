import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import theme from './theme'

// Colour palette from https://colorbrewer2.org/#type=sequential&scheme=PuBu&n=5
// Note this code is duplicated in MapDataLayer - ideally it should be passed in as a prop
// but this makes it require react.memo or similar. Could be done with context too.
// const coloursForCounts = {
//   10: '#f1eef6',
//   50: '#bdc9e1',
//   100: '#74a9cf',
//   250: '#2b8cbe',
//   500: '#045a8d',
// }
/**
 * convert CSS colour in rgb to rgba
 *
 * @param {*} rgbStr - e.g. `rgb(2, 54, 84)`
 * @param {*} opacity - e.g `0.8`
 * @returns csc rgba string value - e.g. `rgba(2, 54, 84, 0.8)`
 */
function rgbToRgba(rgbStr, opacity = 1) {
  let rgbaValue = ''
  const correctedOpacity = opacity + 0.5 <= 1 ? opacity + 0.5 : 1

  if (rgbStr.startsWith('rgb')) {
    // rgb string (is output from lighten/darken functions)
    const values = rgbStr.slice(4, -1) // remove the `rgb(` and `)`
    rgbaValue = `rgba(${values}, ${correctedOpacity})`
  } else {
    // hex colour stirng
    const [r, g, b] = rgbStr.match(/\w\w/g).map((x) => parseInt(x, 16))
    rgbaValue = `rgba(${r},${g},${b},${correctedOpacity})`
  }

  return rgbaValue
}

function Legend({ fillOpacity }) {
  const map = useMap()
  const legendRef = useRef(null)
  const colours = theme.palette.grids.coloursForCounts

  // console.log('map', map?.zoom)
  useEffect(() => {
    if (map) {
      // Add legend to map
      const legend = L.control({ position: 'bottomright' })
      legend.onAdd = () => {
        const div = L.DomUtil.create('div', 'info legend')
        const title = '<h4>Records per grid</h4>'
        const entries = []
        const keysArray = Object.keys(colours).slice(0, 5)
        keysArray.forEach((count, index) => {
          const lower = Number(keysArray[index - 1] || 0) + 1
          const upper = keysArray.length === index + 1 ? ` +` : `– ${count}`
          entries.push(
            `<i style="background-color:${rgbToRgba(
              colours[count],
              fillOpacity
            )}"></i><span>${lower} ${upper}</span><br>`
          )
        })
        div.innerHTML = `${title}${entries.join('')}`
        return div
      }
      legendRef.current = legend
      legend.addTo(map)
    }

    return () => {
      // cleanup function
      // prevent duplicate controls appreaing in dev mode
      if (legendRef.current) {
        map.removeControl(legendRef.current)
      }
    }
  }, [fillOpacity])

  return null
}

export default Legend

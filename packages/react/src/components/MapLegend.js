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

function Legend() {
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
            `<i style="background:${colours[count]}"></i><span>${lower} ${upper}</span><br>`
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
  }, [])

  return null
}

export default Legend

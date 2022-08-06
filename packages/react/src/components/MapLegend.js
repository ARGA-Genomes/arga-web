import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

function Legend({ coloursForCounts }) {
  const map = useMap()
  const legendRef = useRef(null)

  // console.log('map', map?.zoom)
  useEffect(() => {
    if (map) {
      // Add legend to map
      const legend = L.control({ position: 'bottomright' })
      legend.onAdd = () => {
        const div = L.DomUtil.create('div', 'info legend')
        const title = '<h4>Records per grid</h4>'
        const entries = []
        const keysArray = Object.keys(coloursForCounts)
        keysArray.forEach((count, index) => {
          const lower = Number(keysArray[index - 1] || 0) + 1
          const upper = keysArray.length === index + 1 ? ` +` : `– ${count}`
          entries.push(
            `<i style="background:${coloursForCounts[count]}"></i><span>${lower} ${upper}</span><br>`
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

import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

function Legend({ legendState, setLegendState, coloursForCounts }) {
  const map = useMap()
  // console.log('map', map?.zoom)
  useEffect(() => {
    if (legendState) {
      // hack to prevent duplicate legend appearing on map
      map.removeControl(legendState)
    } else if (map && !legendState) {
      // Add legend to map
      const legend = L.control({ position: 'bottomright' })

      legend.onAdd = () => {
        const div = L.DomUtil.create('div', 'info legend')
        const title = '<h4>Records per square</h4>'
        const entries = []
        const keysArray = Object.keys(coloursForCounts)
        keysArray.forEach((count, index) => {
          const lower = Number(keysArray[index - 1] || 0) + 1
          const upper = keysArray.length === index + 1 ? `${count}+` : count
          entries.push(
            `<i style="background:${coloursForCounts[count]}"></i><span>${lower} – ${upper}</span><br>`
          )
        })
        div.innerHTML = `${title}${entries.join('')}`
        return div
      }
      setLegendState(legend)
      legend.addTo(map)

      // const info = L.control({ position: 'bottomright' })
      // info.onAdd = () => {
      //   info.div = L.DomUtil.create('div', 'info')
      //   info.update()
      //   return info.div
      // }

      // info.update = () => {
      //   const heading = '<h4>Heatmap colours</h4>'
      //   const content = '<b>Lorem ipsum dolor sit amet</b>'
      //   info.div.innerHTML = `${heading}${content}`
      // }
      //
      // info.addTo(map)
    }
  }, [legendState])

  return null
}

export default Legend

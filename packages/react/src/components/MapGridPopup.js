import { useMemo } from 'react'

const solrGeoField = 'quad' // 'packedQuad'

/**
 * Component to display a Leaflet popup for a feature
 *
 * @param {*}
 * @returns
 */
function MapGridPopup({ feature, setFqState }) {
  const latlng = useMemo(() => feature?.properties?.latlng, [])
  const geoField = useMemo(() => feature?.properties?.geoField, [])
  const wktField = useMemo(() => feature?.properties?.wkt, [])

  let popupContent = '-1'
  if (feature.properties && feature.properties.count) {
    popupContent = feature.properties.count
  }

  const onFilterRecords = (e) => {
    e.stopPropagation()
    e.preventDefault()
    const wktFq = wktField
      ? `{!field f=${solrGeoField}}Intersects(${wktField})`
      : ''
    const fq = wktField ? { [wktFq]: '' } : { [geoField]: [latlng] }
    setFqState((old) => ({ ...old, ...fq }))
  }

  return (
    <div>
      {popupContent.toLocaleString()} sequence records
      <br />
      <a href="#" onClick={onFilterRecords}>
        Filter results for this area
      </a>
      {/* <br />
      <a href="#" onClick={onShowRecords}>
        View {popupContent.toLocaleString()} records
      </a> */}
    </div>
  )
}

export default MapGridPopup

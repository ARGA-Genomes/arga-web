import { useState, useEffect, useMemo } from 'react'

const serverUrlPrefix = 'https://nectar-arga-dev-1.ala.org.au/api'

// function getBboxForCoords(coords) {
//   console.log('getBboxForCoords coords', coords)
//   const ff = 0 // 0.0000001 // fudge factor
//   let bbox = '[]'
//   if (coords && coords.length > 0) {
//     bbox = `[${coords[0][3][0] + ff},${coords[0][1][1] + ff} TO ${
//       coords[0][1][0] - ff
//     },${coords[0][3][1] - ff}]`
//   }
//   console.log('getBboxForCoords bbox', bbox)
//   // TODO
//   // geohash:[-44,112%20TO%20-10,155] bottom-left TO top-right
//   return bbox
// }

// Fixed = This is being statically rendered due to being pulled in via `ReactDOMServer.renderToString()`
// try portals trick - https://stackoverflow.com/a/69353273/249327
function MapGridPopup({
  feature,
  pageState,
  // setDrawerState,
  fqState,
  setFqState,
}) {
  const [popupState, setPopupState] = useState({
    // coords: getBboxForCoords(feature.geometry.coordinates),
    isLoading: false,
    data: [], // should be array of IDs only
    total: 0,
  })

  const latlng = useMemo(() => feature?.properties?.latlng, [])
  const geoField = useMemo(() => feature?.properties?.geoField, [])

  useEffect(() => {
    // console.log('fetchData', geoField, latlng)
    const abortController = new AbortController() // if mulitple requests (clicks with slow connection) - service just the last one
    const fetchData = async () => {
      setPopupState((old) => ({
        ...old,
        isLoading: true,
      }))
      // Build `fq` params
      const fqParamList = []
      Object.keys(fqState).forEach((key) => {
        if (fqState[key].length > 0) {
          fqState[key].forEach((val) => {
            fqParamList.push(`${key}:%22${val}%22`)
          })
        }
      })
      const url = `${serverUrlPrefix}/select?q=${
        pageState.q || '*:*'
      }&fq=${fqParamList.join('&fq=')}&fq=${geoField}:%22${latlng}%22` // &fq=geohash:${bboxCoords}&fl=id`

      // Do HTTP fetch
      const response = await fetch(url, { signal: abortController.signal })
      // wait for async response
      const json = await response.json()
      setPopupState((old) => ({
        ...old,
        isLoading: false,
        data: json.response.docs,
        total: json.response.numFound,
      }))
    }
    fetchData().catch(() => {
      setPopupState((old) => ({
        ...old,
        isLoading: false,
      }))
      // TODO dispay error message using a global context
      // const msg = `Oops something went wrong. ${error.message}`
      // setSnackState({ status: true, message: msg })
    })

    return () => {
      abortController.abort()
    }
  }, [pageState.q, fqState, popupState.coords])

  let popupContent = '-1'
  if (feature.properties && feature.properties.count) {
    popupContent = feature.properties.count
  }

  const onFilterRecords = () => {
    const fq = { [geoField]: [latlng] }
    setFqState((old) => ({ ...old, ...fq }))
  }

  // const onShowRecords = () => {
  //   onFilterRecords()
  //   setDrawerState(true)
  // }

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

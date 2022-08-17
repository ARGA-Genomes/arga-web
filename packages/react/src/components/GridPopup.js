import { useState, useEffect, useMemo } from 'react'

const serverUrlPrefix = 'https://nectar-arga-dev-1.ala.org.au/api'

function getBboxForCoords(coords) {
  console.log('getBboxForCoords coords', coords)
  const ff = 0 // 0.0000001 // fudge factor
  let bbox = '[]'
  if (coords && coords.length > 0) {
    bbox = `[${coords[0][3][0] + ff},${coords[0][1][1] + ff} TO ${
      coords[0][1][0] - ff
    },${coords[0][3][1] - ff}]`
  }
  console.log('getBboxForCoords bbox', bbox)
  // TODO
  // geohash:[-44,112%20TO%20-10,155] bottom-left TO top-right
  return bbox
}

// Fixed = This is being statically rendered due to being pulled in via `ReactDOMServer.renderToString()`
// try portals trick - https://stackoverflow.com/a/69353273/249327
function GridPopup({ feature, pageState, fqState }) {
  const [popupState, setPopupState] = useState({
    // coords: getBboxForCoords(feature.geometry.coordinates),
    isLoading: false,
    data: [], // should be array of IDs only
    total: 0,
  })

  const bboxCoords = useMemo(
    () => getBboxForCoords(feature.geometry.coordinates),
    []
  )

  // useEffect(() => {
  //   console.log('useEffect coords', feature.geometry.coordinates)
  //   if (feature.geometry && feature.geometry.coordinates) {
  //     setPopupState((old) => ({
  //       ...old,
  //       coords: getBboxForCoords(feature.geometry.coordinates),
  //     }))
  //   }
  // }, [])

  useEffect(() => {
    console.log('fetchData bboxCoords', bboxCoords)
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
      }&fq=${fqParamList.join('&fq=')}&fq=geohash:${bboxCoords}&fl=id`

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

  // feature.geometry.coordinates

  return (
    <div>
      {popupContent.toLocaleString()} sequence entries
      {/* ({JSON.stringify(feature.geometry.coordinates)}) */}
      <br />
      {/* {popupState.total} found in {bboxCoords}<br /> */}
      <a href="#" onClick={() => alert('Not implemented yet 🔨')}>
        View sequences for this area
      </a>
    </div>
  )
}

export default GridPopup

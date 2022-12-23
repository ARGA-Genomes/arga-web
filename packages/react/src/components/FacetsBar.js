import React, { useState, useEffect } from 'react'
import {
  TextField,
  Box,
  Button,
  InputAdornment,
  IconButton,
  Divider,
  Grid,
  Tooltip,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
// import { useSearchParams } from 'react-router-dom'
import FacetSelect from './FacetSelect'
import theme from './theme'
import useUrlParams from '../hooks/UrlParams'
// import config from './config'

/**
 * Component to output a "filter" bar for filtering search results
 *
 * @param {Object} pageState The useState "read" object representing SOLR params
 * @param {function(Object) : undefined} setPageState The callback to set pageState
 * @param {Object} fqState The useState "read" object representing SOLR `fq` params (only)
 * @param {function(Object) : undefined} setFqState The callback to set fqState
 * @returns
 */
export default function FacetsBar({
  pageState,
  // setPageState,
  fqState,
  // setFqState,
}) {
  // State for search input - bind it to `pageState.q`. I'm not using it directly due to it repeatedly calling
  // SOLR when the user is typing. User has to click search icon or hit enter to bind it to the `pageState.q`
  const [inputState, setInputState] = useState('') // search input field
  const [solrParams, setSolrParams] = useUrlParams()

  useEffect(() => {
    if ((!inputState && solrParams.q) || inputState !== solrParams.q) {
      setInputState(solrParams.q)
    }
  }, [solrParams.q])

  // callback triggered by enter or clicking the search action button (magnifier icon)
  const searchClickEvent = () => {
    // setPageState((old) => ({
    //   ...old,
    //   q: inputState,
    // }))
    // setFqState({})
    // console.log('searchClickEvent', inputState)
    setSolrParams((old) => {
      const copy = { ...old }
      delete copy.fq
      // copy.delete('fq') // q has changed so we reset any fq filters
      copy.q = inputState // replace q value
      return copy
    })

    // ({
    //   ...old,
    //   old.delete('fq'),
    //   q: inputState,
    // }))
  }

  const searchKeyPress = (e) => {
    if (e.code === 'Enter') {
      searchClickEvent()
    }
  }

  // callback for the [x] on the search input text field
  const clearSearch = () => {
    setInputState('')
    setSolrParams((old) => {
      const copy = { ...old }
      delete copy.q // remove from URL
      delete copy.fq // q has changed so we remove any fq params too
      return copy
    })
  }

  const facetsDisplay = {}
  const facetFieldList = Object.keys(pageState.facetResults)

  if (facetFieldList.length > 0) {
    facetFieldList.forEach((field) => {
      const values = pageState.facetResults[field] // array
      const newValueArray = []
      for (let i = 0; i < values.length; i += 2) {
        const name = values[i]
        const count = values[i + 1]
        newValueArray.push({ name, count })
      }
      facetsDisplay[field] = newValueArray
    })
  }

  // Any remaining fq params in REST request NOT shown in facetFieldList are added to this array
  const extraFqParams = Object.keys(fqState).filter(
    (fq) => !(fq in facetsDisplay)
  )

  const formatFacetText = (fqName) => {
    let content = ''
    if (fqState[fqName]) {
      // regular `field: value` output
      content = `${fqName}: ${fqState[fqName]}`
    } else {
      // handle WKT filter, e.g. `{!field f=quad}Intersects(POLYGON((137.8125 -31.640625, 137.8125 -32.34375,139.21875 -32.34375, 139.21875 -31.640625,137.8125 -31.640625)))`
      const polygonPosition = fqName.search('POLYGON')
      const circlePosition = fqName.search('geofilt')
      if (polygonPosition > 0) {
        const coords = fqName
          .slice(polygonPosition + 9, -3)
          .split(',')[0]
          .split(' ')
        const truncatedCoords = coords.map((coord) =>
          Number.isNaN(coord) ? coord : parseFloat(coord).toFixed(4)
        )
        content = `POLYGON: ${truncatedCoords[0]}, ${truncatedCoords[1]}`
      } else if (circlePosition > 0) {
        // {!geofilt sfield=location}&pt=-21.777355,131.835938&d=582
        const [point, distance] = fqName.split('&').slice(-2)
        content = `CIRCLE: ${point}, ${distance}`
      } else {
        content = fqName
      }
    }

    return content
  }

  // callback for the [x] on any set facet filters
  const removeFilter = (fqName) => () => {
    const fqCopy = { ...solrParams.fq }
    delete fqCopy[fqName]
    setSolrParams((old) => ({ ...old, fq: fqCopy }))
  }

  return (
    <Box
      sx={{
        border: '1px solid rgba(224, 224, 224, 1)',
        borderRadius: '4px',
        padding: 1,
        backgroundColor: theme.palette.success.light,
      }}
    >
      <Grid container spacing={1}>
        <Grid item xs={12} sm={8} md={6} lg={5} xl={5}>
          <TextField
            size="small"
            label="Search"
            value={inputState || ''}
            onChange={(e) => setInputState(e.target.value)}
            onKeyPress={searchKeyPress}
            sx={{
              width: '100%',
              '& .MuiInputLabel-root, .MuiOutlinedInput-root': {
                fontSize: '14px',
                paddingTop: '2px',
                paddingBottom: '2px',
                paddingRight: '5px',
                bgcolor: 'white',
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {inputState && (
                    <IconButton
                      sx={{ padding: 1 }}
                      aria-label="clear search"
                      onClick={clearSearch}
                    >
                      <CloseIcon />
                    </IconButton>
                  )}
                  <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                  <IconButton
                    onClick={searchClickEvent}
                    sx={{ padding: 1 }}
                    aria-label="search"
                  >
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            variant="outlined"
          />
        </Grid>
        {extraFqParams.map((fqName) => (
          <Grid
            item
            xs={6}
            sm={4}
            md={2}
            lg={3}
            key={fqName}
            sx={{ marginTop: '2px' }}
          >
            {/* <Chip
              sx={{ backgroundColor: theme.palette.background.paper }}
              label={`${fqName}: ${fqState[fqName]}`}
              variant="outlined"
              size="large"
              onDelete={handleDelete(fqName)}
            /> */}
            <Tooltip title="Click to remove filter" arrow>
              <Button
                sx={{
                  backgroundColor: theme.palette.primary.mid,
                  color: theme.palette.background.paper,
                  textTransform: 'none',
                  width: '100%',
                  '&:hover': {
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                  },
                }}
                variant="outlined"
                onClick={removeFilter(fqName)}
                endIcon={<CloseIcon />}
              >
                {formatFacetText(fqName)}
              </Button>
            </Tooltip>
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={0} columnSpacing={1}>
        {Object.keys(facetsDisplay).map((field) => (
          <Grid
            item
            xs={6}
            sm={4}
            md={2}
            lg={2}
            key={field}
            sx={{ marginTop: 1 }}
          >
            <FacetSelect
              field={field}
              fieldValues={facetsDisplay[field]}
              fqState={fqState[field] || []}
              // setFqState={setFqState}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

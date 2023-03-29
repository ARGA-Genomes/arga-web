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
import { useSearchParams } from 'react-router-dom'
import FacetSelect from './FacetSelect'
import theme from './theme'

const facetFieldsTransform = {
  speciesListUid: {
    dr18717: 'Top 100 priority species 2022',
    // dr649: 'ACT conservation status',
    // dr650: 'NSW conservation status',
    // dr651: 'NT conservation status',
    // dr652: 'Qld conservation status',
    // dr653: 'SA conservation status',
    // dr654: 'Tas conservation status',
    // dr655: 'Vic conservation status',
    // dr2201: 'WA conservation status',
  },
}

function filterFacetValues(field, values) {
  const returnValues = []

  if (Object.keys(facetFieldsTransform).includes(field)) {
    const thisFacetFilter = facetFieldsTransform[field]
    const filteredValues = values.filter((val) =>
      Object.keys(thisFacetFilter).includes(val.name)
    )
    filteredValues.forEach((valObj) => {
      valObj.label = thisFacetFilter[valObj.name]
    })
    returnValues.push(...filteredValues)
  } else {
    returnValues.push(...values)
  }

  return returnValues
}
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
  setPageState,
  fqState,
  setFqState,
}) {
  // State for search input - bind it to `pageState.q`. I'm not using it directly due to it repeatedly calling
  // SOLR when the user is typing. User has to click search icon or hit enter to bind it to the `pageState.q`
  const [inputState, setInputState] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    if ((!inputState && pageState.q) || inputState !== pageState.q) {
      setInputState(pageState.q)
    }
  }, [pageState.q])

  const searchClickEvent = () => {
    setPageState((old) => ({
      ...old,
      q: inputState,
    }))
    setFqState({})
  }

  const searchKeyPress = (e) => {
    if (e.code === 'Enter') {
      searchClickEvent()
    }
  }

  const clearSearch = () => {
    setPageState((old) => ({
      ...old,
      q: '',
      page: 1,
    }))
    setFqState({})
    setInputState('')
    searchParams.delete('q')
    setSearchParams(searchParams)
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

  const handleDelete = (fqName) => () => {
    setFqState((current) => {
      const copy = { ...current }
      delete copy[fqName]
      return copy
    })
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
            value={inputState}
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
                      aria-label="search"
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
                onClick={handleDelete(fqName)}
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
              // fieldValues={facetsDisplay[field]}
              fieldValues={filterFacetValues(field, facetsDisplay[field])}
              fqState={fqState[field] || []}
              setFqState={setFqState}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

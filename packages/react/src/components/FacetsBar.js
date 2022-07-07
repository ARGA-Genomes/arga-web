import React, { useState, useEffect } from 'react'
import {
  TextField,
  Box,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import { lighten } from '@mui/material/styles'
import FacetSelect from './FacetSelect'
import theme from './theme'

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

  return (
    <Box
      sx={{
        border: '1px solid rgba(224, 224, 224, 1)',
        borderRadius: '4px',
        padding: 1,
        // backgroundColor: 'white',
        backgroundColor: lighten(theme.palette.success.main, 0.7),
      }}
    >
      <TextField
        size="small"
        label="Search"
        value={inputState}
        onChange={(e) => setInputState(e.target.value)}
        onKeyPress={searchKeyPress}
        // style={{ width: '50ch' }}
        sx={{
          // fontSize: '14px',
          width: '50ch',
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
      <Box>
        {Object.keys(facetsDisplay).map((field) => (
          <FacetSelect
            key={field}
            field={field}
            fieldValues={facetsDisplay[field]}
            fqState={fqState[field] || []}
            setFqState={setFqState}
          />
        ))}
      </Box>
    </Box>
  )
}

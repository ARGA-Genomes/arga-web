import {
  TextField,
  Box,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import React, { useState, useEffect } from 'react'
import FacetSelect from './FacetSelect'

export default function FacetsBar({ pageState, setPageState }) {
  const [inputState, setInputState] = useState('')

  useEffect(() => {
    if ((!inputState && pageState.q) || inputState !== pageState.q) {
      setInputState(pageState.q)
    }
  }, [pageState.q])

  const searchClickEvent = () => {
    setPageState((old) => ({
      ...old,
      fq: [],
      q: inputState,
    }))
  }

  const searchKeyPress = (e) => {
    if (e.code === 'Enter') {
      searchClickEvent()
    }
  }

  const clearSearch = () => {
    setPageState((old) => ({
      ...old,
      fq: [],
      q: '',
      page: 1,
    }))
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
        backgroundColor: 'white',
        padding: 1,
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
            pageState={pageState}
            setPageState={setPageState}
          />
        ))}
      </Box>
    </Box>
  )
}

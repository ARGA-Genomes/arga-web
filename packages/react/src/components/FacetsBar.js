import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  // TextField,
  Checkbox,
  ListItemText,
  Box,
  Typography,
  IconButton,
  InputBase,
  Divider,
  // Paper,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import React, { useState, useEffect } from 'react'
import { startCase, replace } from 'lodash'

function formatLabels(label) {
  const lab = replace(label, /dynamicProperties_ncbi_/g, '')
  return startCase(lab)
}

export default function FacetsBar({ pageState, setPageState }) {
  const [inputState, setInputState] = useState('')

  useEffect(() => {
    if (!inputState && pageState.q) {
      setInputState(pageState.q)
    } else if (inputState !== pageState.q) {
      setInputState(pageState.q)
    }
  }, [pageState.q])

  const handleChange = (event) => {
    // setSelectVal({ value: event.target.value })
    const {
      target: { value },
    } = event
    console.log('handleChange', event.target, value)
    setPageState((old) => ({
      ...old,
      fq: [...old.fq, `${event.target.name}:%22${event.target.value}%22`],
    }))
  }

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
      }}
    >
      <Box
        // component="form"
        sx={{
          p: '10px 10px 0 10px',
          '& .MuiTextField-root *': { fontSize: '14px' },
        }}
        noValidate
        autoComplete="off"
      >
        <Box
          // component="form"
          sx={{
            p: '2px 4px',
            display: 'flex',
            alignItems: 'center',
            width: 400,
            border: '1px solid #c4c4c4',
            borderRadius: '4px',
          }}
        >
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            size="small"
            placeholder="Search"
            label="Serch"
            value={inputState}
            onChange={(e) => setInputState(e.target.value)}
            onKeyPress={searchKeyPress}
            inputProps={{ 'aria-label': 'Search' }}
          />
          {inputState && (
            <IconButton
              sx={{ p: '10px' }}
              aria-label="search"
              onClick={clearSearch}
            >
              <CloseIcon />
            </IconButton>
          )}
          <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
          <IconButton
            onClick={searchClickEvent}
            sx={{ p: '10px' }}
            aria-label="search"
          >
            <SearchIcon />
          </IconButton>
        </Box>
        {/* <TextField
          size="small"
          label="Search"
          value={pageState.q}
          style={{ width: '50ch' }}
          onChange={(e) =>
            setPageState((old) => ({
              ...old,
              q: e.target.value,
              fq: [],
              page: 1,
            }))
          }
          // onKeyPress={searchKeyPress}
        /> */}
      </Box>

      {Object.keys(facetsDisplay).map((field) => (
        <FormControl
          key={field}
          sx={{
            m: '10px 0 10px 10px',
            minWidth: 180,
            ' *': { fontSize: '14px' },
            ' & .MuiOutlinedInput-input': {
              paddingTop: '7px',
              paddingBottom: '7px',
            },
          }}
          size="small"
        >
          <InputLabel id={`${field}-input`}>{formatLabels(field)}</InputLabel>
          <Select
            labelId={`${field}-input`}
            id={`${field}-input`}
            value={[]}
            name={field}
            multiple
            size="small"
            onChange={handleChange}
            renderValue={(value) => value}
            label={formatLabels(field)}
          >
            <Typography
              sx={{
                '& .MuiMenuItem-root *': { fontSize: '14px' },
                '& .MuiMenuItem-root': {
                  lineHeight: '14px',
                  p: 0,
                  paddingRight: '8px',
                },
              }}
            >
              {/* <MenuItem value="">
                <em>None</em>
              </MenuItem> */}
              {facetsDisplay[field].map((it) => (
                <MenuItem value={it.name} key={`${field}${it.name}`}>
                  {/* {it.name} ({it.count}) checked={personName.indexOf(name) > -1} */}
                  <Checkbox />
                  <ListItemText primary={`${it.name} (${it.count})`} />
                </MenuItem>
              ))}
            </Typography>
          </Select>
        </FormControl>
      ))}
    </Box>
  )
}

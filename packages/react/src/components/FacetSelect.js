import React from 'react'
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Box,
  Chip,
  OutlinedInput,
  Typography,
} from '@mui/material'
// import { startCase } from 'lodash'
import {
  getLabelForName,
  formatLabels,
  formatFacetValue,
} from '../utils/formatLabel'

// TODO: move into main function and memoize it, as it depends on `useState` variable
const removeFacet = (setFqState, newArray, field) => {
  if (newArray.length > 0) {
    // still other selected facets with same field present
    const fqObj = { [field]: [...newArray] }
    setFqState((old) => ({ ...old, ...fqObj }))
  } else {
    // no more facets for this field, so just delete it
    setFqState((current) => {
      const copy = { ...current }
      delete copy[field]
      return copy
    })
  }
}

/**
 * Component to output a single `Select` component for filtering by `fq` param
 * State is maintained via the `[fqState, setFqState]` state vars in Search.js
 *
 * @param {String} field The SOLR field name for the current filter/facet
 * @param {Array : String} fieldValues The list of values that are available to filter on for this current `field`
 * @param {Object} fqState The useState "read" object representing SOLR `fq` params (only)
 * @param {function(Object) : undefined} setFqState The callback to set fqState
 * @returns
 */
export default function FacetsSelect({
  field,
  fieldValues,
  fqState: thisFqState, // is array of values for just this `field` (not all facets like the parent version)
  setFqState,
}) {
  const handleSelectChange = (event) => {
    const {
      target: { value },
    } = event
    const valueArray = typeof value === 'string' ? value.split(',') : value

    if (valueArray.length > thisFqState.length) {
      // add new fq
      const fqObj = { [field]: [...valueArray] }
      setFqState((old) => ({ ...old, ...fqObj }))
    } else {
      // remove an element
      const newArray = thisFqState.filter((x) => valueArray.includes(x))
      removeFacet(setFqState, newArray, field)
    }
  }

  const handleDelete = (chipToDelete) => () => {
    const newArray = thisFqState.filter((x) => x !== chipToDelete)
    removeFacet(setFqState, newArray, field)
  }

  return (
    <FormControl
      key={field}
      sx={{
        marginRight: 1,
        width: '100%',
        '*': { fontSize: '14px' },
        '& .MuiOutlinedInput-input': {
          paddingTop: '8px',
          paddingBottom: '7px',
        },
      }}
      size="small"
    >
      <InputLabel id={`${field}-input`}>{formatLabels(field)}</InputLabel>
      <Select
        labelId={`${field}-input`}
        id={`${field}-input`}
        value={thisFqState}
        name={field}
        multiple
        size="small"
        onChange={handleSelectChange}
        input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.map((value) => (
              <Chip
                key={value}
                label={getLabelForName(field, value, fieldValues)}
                size="small"
                onMouseDown={(e) => {
                  e.stopPropagation()
                }}
                // onDelete={() => {
                //   handleChipDelete(value)
                // }}
                onDelete={handleDelete(value)}
              />
            ))}
          </Box>
        )}
        label={formatLabels(field)}
        sx={{
          backgroundColor: 'white',
          '&  .MuiTypography-root': {
            fontSize: '12px',
          },
        }}
      >
        {fieldValues.map((it) => (
          <MenuItem
            value={it.name}
            key={it.name}
            sx={{ padding: 0, paddingRight: 1 }}
          >
            <Checkbox
              checked={thisFqState?.indexOf(it.name) > -1}
              sx={{ '& svg': { fontSize: '18px' } }}
            />
            <ListItemText
              // primary={it.name}
              primary={
                <Typography
                  sx={{ fontSize: '14px', paddingRight: '0.5em' }}
                  component="span"
                >
                  {formatFacetValue(field, it.label || it.name)}
                </Typography>
              }
              // secondary={it.count}
              secondary={
                <Typography
                  sx={{ fontSize: '12px' }}
                  component="span"
                  variant="span"
                  color="rgba(0, 0, 0, 0.6)"
                >
                  ({it.count})
                </Typography>
              }
            />
          </MenuItem>
        ))}
        {/* </Box> */}
      </Select>
    </FormControl>
  )
}

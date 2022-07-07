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
import { startCase, replace } from 'lodash'

/**
 * Create a human readable label from a SOLR field name
 *
 * @param {String} label SOLR field name
 * @returns formatted label
 */
function formatLabels(label) {
  const lab = replace(label, /dynamicProperties_ncbi_/g, '')
  return startCase(lab)
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
  fqState,
  setFqState,
}) {
  const handleSelectChange = (event) => {
    const {
      target: { value },
    } = event
    const valueArray = typeof value === 'string' ? value.split(',') : value

    if (valueArray.length > fqState.length) {
      // add new fq
      const fqObj = { [field]: [...valueArray] }
      setFqState((old) => ({ ...old, ...fqObj }))
    } else {
      // remove an element
      const newArray = fqState.filter((x) => valueArray.includes(x))
      const fqObj = { [field]: [...newArray] }
      setFqState((old) => ({ ...old, ...fqObj }))
    }
  }

  const handleDelete = (chipToDelete) => () => {
    const newArray = fqState.filter((x) => x !== chipToDelete)
    const fqObj = { [field]: [...newArray] }
    setFqState((old) => ({ ...old, ...fqObj }))
  }

  return (
    <FormControl
      key={field}
      sx={{
        // m: '10px 0 10px 10px',
        // marginTop: 1,
        marginRight: 1,
        // minWidth: 180,
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
        value={fqState}
        name={field}
        multiple
        size="small"
        onChange={handleSelectChange}
        // onClose={handleClose}
        // onOpen={handleOpen}
        // renderValue={(value) => value}
        input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.map((value) => (
              <Chip
                key={value}
                label={value}
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
            {/* {it.name} ({it.count}) checked={personName.indexOf(name) > -1} */}
            <Checkbox
              checked={fqState?.indexOf(it.name) > -1}
              sx={{ '& svg': { fontSize: '18px' } }}
            />
            <ListItemText
              // primary={it.name}
              primary={
                <Typography
                  sx={{ fontSize: '14px', paddingRight: '0.5em' }}
                  component="span"
                  // variant="span"
                  // color="grey"
                >
                  {it.name}
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
              // sx={{
              //   '& span': { fontSize: '14px' },
              //   '& p': { fontSize: '12px' },
              // }}
            />
          </MenuItem>
        ))}
        {/* </Box> */}
      </Select>
    </FormControl>
  )
}

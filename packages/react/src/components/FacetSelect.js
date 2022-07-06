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

function formatLabels(label) {
  const lab = replace(label, /dynamicProperties_ncbi_/g, '')
  return startCase(lab)
}

export default function FacetsSelect({
  field,
  fieldValues,
  fqList,
  setFqList,
}) {
  const handleSelectChange = (event) => {
    const {
      target: { value },
    } = event
    const valueArray = typeof value === 'string' ? value.split(',') : value

    if (valueArray.length > fqList.length) {
      // add new fq
      const fqObj = { [field]: [...valueArray] }
      setFqList((old) => ({ ...old, ...fqObj }))
    } else {
      // remove an element
      const newArray = fqList.filter((x) => valueArray.includes(x))
      const fqObj = { [field]: [...newArray] }
      setFqList((old) => ({ ...old, ...fqObj }))
    }
  }

  const handleDelete = (chipToDelete) => () => {
    const newArray = fqList.filter((x) => x !== chipToDelete)
    const fqObj = { [field]: [...newArray] }
    setFqList((old) => ({ ...old, ...fqObj }))
  }

  return (
    <FormControl
      key={field}
      sx={{
        // m: '10px 0 10px 10px',
        marginTop: 1,
        marginRight: 1,
        minWidth: 180,
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
        value={fqList}
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
              checked={fqList?.indexOf(it.name) > -1}
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

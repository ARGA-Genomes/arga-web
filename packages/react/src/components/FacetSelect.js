import React, { useState, useEffect } from 'react'
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
  pageState,
  setPageState,
}) {
  const [selectArray, setSelectArray] = useState([])

  // console.log('state check', selectArray)

  useEffect(() => {
    const fqArray = pageState.fq
    const fqsWithFieldSet = fqArray.filter((el) => el.includes(field)) // true if field is "speciesGroup" and fq is "&fq=speciesGroup:%22Animals%22"
    // console.log('fqsWithFieldSet', fqsWithFieldSet, selectArray)
    const newSelectArray = []

    fqsWithFieldSet.forEach((fq) => {
      // console.log('fqsWithFieldSet', fq, selectArray)

      if (
        selectArray.length < 1 ||
        selectArray.some((el) => fq.indexOf(el) < 0) // !fq.includes(el))
      ) {
        const val = fq.split(':')[1]?.replaceAll('%22', '')
        // setSelectArray((old) => [...old, val])
        newSelectArray.push(val)
        // console.log('selectArray', val, selectArray)
      }
    })
    // console.log('newSelectArray', newSelectArray, selectArray)
    setSelectArray((old) => [...old, ...newSelectArray])
  }, [pageState.fq])

  // useEffect(() => {
  //   selectArray.forEach((select) => {
  //     const fqContainsSelectItem = pageState.fq.find((element) => {
  //       if (element.includes(select)) {
  //         return true
  //       }
  //     })

  //     if (fqContainsSelectItem) {
  //     }
  //   })

  //   if (selectArray && fqContainsSelectItem) {
  //     setPageState((old) => ({
  //       ...old,
  //       fq: [...old.fq, `${field}:%22${event.target.value}%22`],
  //     }))
  //   } else {
  //   }
  // }, [selectArray])

  const handleSelectChange = (event) => {
    const {
      target: { value },
    } = event
    setSelectArray(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value
    )

    if (value.length > 0) {
      setPageState((old) => ({
        ...old,
        fq: [...old.fq, `${field}:%22${value.join(`%22&fq=${field}:%22`)}%22`],
      }))
    } else {
      // removed element
      setPageState((old) => ({
        ...old,
        fq: old.fq.filter((el) => !el.includes(field)),
      }))
    }
  }

  const handleDelete = (chipToDelete) => () => {
    // console.log('handleDelete', field, chipToDelete, selectArray)
    setSelectArray((vals) => vals.filter((val) => val !== chipToDelete))
    // remove from `fq` in pagState
    setPageState((old) => ({
      ...old,
      fq: old.fq.filter(
        (filter) => filter !== `${field}:%22${chipToDelete}%22`
      ), // !fq.includes(chipToDelete.key)
    }))
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
        value={selectArray}
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
              checked={selectArray.indexOf(it.name) > -1}
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

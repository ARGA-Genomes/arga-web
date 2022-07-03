import { FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import React, { Fragment } from 'react'
import { startCase, replace } from 'lodash'

function formatLabels(label) {
  const lab = replace(label, /dynamicProperties_ncbi_/g, '')
  return startCase(lab)
}

export default function FacetsBar({ pageState, setPageState }) {
  // const [selectVal, setSelectVal] = React.useState('')

  const handleChange = (event) => {
    // setSelectVal({ value: event.target.value })
    console.log('handleChange', event.target)
    setPageState((old) => ({
      ...old,
      fq: [...old.fq, `${event.target.name}:%22${event.target.value}%22`],
    }))
  }

  const facetsDisplay = {}
  const facetFieldList = Object.keys(pageState.facetResults)
  console.log('facetResults', pageState)

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
    <>
      {Object.keys(facetsDisplay).map((field) => (
        <FormControl key={field} sx={{ minWidth: 180 }} size="small">
          <InputLabel id={`${field}-input`}>{formatLabels(field)}</InputLabel>
          <Select
            labelId={`${field}-input`}
            id={`${field}-input`}
            value=""
            name={field}
            onChange={handleChange}
            renderValue={(value) => value}
            label={formatLabels(field)}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {facetsDisplay[field].map((it) => (
              <MenuItem value={it.name} key={`${field}${it.name}`}>
                {it.name} ({it.count})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ))}
    </>
  )
}

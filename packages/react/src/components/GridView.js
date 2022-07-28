import { useEffect } from 'react'
// import {  } from '@mui/icons-material'
import { Grid } from '@mui/material'
import SpeciesCard from './SpeciesCard'

function GridView({ pageState, setPageState }) {
  useEffect(() => {
    setPageState((old) => ({ ...old, groupResults: true, pageSize: 24 }))
  }, [pageState.groupResults, pageState.pageState])

  return (
    <Grid container spacing={2} sx={{}}>
      {pageState.species.map((record) => (
        <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={record.groupValue}>
          <SpeciesCard record={record} pageState={pageState} />
        </Grid>
      ))}
    </Grid>
  )
}

export default GridView

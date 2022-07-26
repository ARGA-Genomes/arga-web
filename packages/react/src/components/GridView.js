import { useEffect } from 'react'
import { Grid } from '@mui/material'
import SpeciesCard from './SpeciesCard'

function GridView({ pageState, setPageState }) {
  useEffect(() => {
    setPageState((old) => ({ ...old, groupResults: true, pageSize: 24 }))
  }, [])

  return (
    <Grid container spacing={2} sx={{ backgroundColor: '#E7EBF0' }}>
      {pageState.data.map((record) => (
        <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={record.id}>
          <SpeciesCard record={record} />
        </Grid>
      ))}
    </Grid>
  )
}

export default GridView

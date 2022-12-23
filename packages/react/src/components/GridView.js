import { useEffect } from 'react'
// import {  } from '@mui/icons-material'
import { Box, Grid, TablePagination } from '@mui/material'
import SpeciesCard from './SpeciesCard'
import useUrlParams from '../hooks/UrlParams'

function GridView({ pageState, setPageState, setRecordState }) {
  const defaultPageSize = 24
  const [solrParams, setSolrParams] = useUrlParams()

  useEffect(() => {
    setPageState((old) => ({ ...old, groupResults: true }))
  }, [])

  const page = solrParams.page || 1
  const pageSize = solrParams.pageSize || defaultPageSize

  return (
    <>
      <Grid container spacing={2} sx={{}}>
        {pageState.species.map((record, index) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            lg={3}
            xl={2}
            key={record.groupValue}
          >
            <SpeciesCard
              record={record}
              index={index}
              setRecordState={setRecordState}
              pageState={pageState}
            />
          </Grid>
        ))}
      </Grid>
      <Box sx={{ width: '100%' }}>
        <Grid
          // container
          // spacing={2}
          // justifyContent="center"
          // alignItems="center"
          container
          spacing={1}
          direction="column"
          alignItems="center"
          justifyContent="center"
          style={{ minHeight: '5vh', paddingTop: '20px' }}
        >
          <Grid item sm={12}>
            <TablePagination
              component="div"
              rowsPerPageOptions={[12, 24, 48, 96]}
              // pagination
              page={page - 1} // component uses zero-based `page` count
              rowsPerPage={pageSize}
              onPageChange={(event, newPage) =>
                setSolrParams((old) => ({ ...old, page: newPage + 1 }))
              }
              onRowsPerPageChange={(event) =>
                setSolrParams((old) => ({
                  ...old,
                  page: 1, // reset to page 1 when rows per page changes
                  pageSize: parseInt(event.target.value, 10),
                }))
              }
              count={
                pageState?.total
                  ? Math.ceil(
                      pageState.total / pageSize // TODO: buggy: fix OR'ed value
                    )
                  : 1
              }
            />
            {/* <Pagination
              // count={10}
              page={pageState.page}
              count={Math.ceil(pageState.total / pageState.pageSize)}
              boundaryCount={0}
              siblingCount={3}
              showFirstButton
              onChange={(event, newPage) =>
                setPageState((old) => ({ ...old, page: newPage }))
              }
              variant="outlined"
              shape="rounded"
              color="secondary"
              style={{ opacity: '0.8' }}
            /> */}
          </Grid>
        </Grid>
      </Box>
    </>
  )
}

export default GridView

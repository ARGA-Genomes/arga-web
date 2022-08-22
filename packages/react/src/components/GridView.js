import { useEffect } from 'react'
// import {  } from '@mui/icons-material'
import { Box, Grid, TablePagination } from '@mui/material'
import SpeciesCard from './SpeciesCard'

function GridView({ pageState, setPageState, setRecordState }) {
  useEffect(() => {
    setPageState((old) => ({ ...old, groupResults: true, pageSize: 24 }))
  }, [pageState.groupResults, pageState.pageState])

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
              page={pageState.page - 1}
              rowsPerPage={pageState.pageSize}
              onPageChange={(event, newPage) =>
                setPageState((old) => ({ ...old, page: newPage + 1 }))
              }
              onRowsPerPageChange={(event) =>
                setPageState((old) => ({
                  ...old,
                  page: 1,
                  pageSize: parseInt(event.target.value, 10),
                }))
              }
              count={Math.ceil(pageState.total / pageState.pageSize)}
              // page={page}
              // onPageChange={handleChangePage}
              // rowsPerPage={rowsPerPage}
              // onRowsPerPageChange={handleChangeRowsPerPage}
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

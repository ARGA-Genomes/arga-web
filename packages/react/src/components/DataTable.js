import { useEffect } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { GlobalStyles } from '@mui/material'
import theme from './theme'

function DataTable({ columns, pageState, setPageState, setRecordState }) {
  useEffect(() => {
    setPageState((old) => ({ ...old, groupResults: false, pageSize: 25 }))
  }, [pageState.groupResults, pageState.pageState])

  return (
    <>
      <DataGrid
        // components={{
        //   Toolbar: GridToolbar
        // }}
        autoHeight={false}
        disableSelectionOnClick
        rowHeight={40}
        headerHeight={42}
        // ref={datagridRef}
        style={{ backgroundColor: 'white' }}
        columns={columns}
        rows={pageState.data}
        rowCount={pageState.total}
        loading={pageState.isLoading}
        rowsPerPageOptions={[10, 25, 50, 70, 100]}
        // pagination
        page={pageState.page - 1}
        pageSize={pageState.pageSize}
        paginationMode="server"
        sortingMode="server"
        sortModel={[pageState]}
        onPageChange={(newPage) =>
          setPageState((old) => ({ ...old, page: newPage + 1 }))
        }
        onPageSizeChange={(newPageSize) =>
          setPageState((old) => ({ ...old, pageSize: newPageSize }))
        }
        onSortModelChange={(sortModel) =>
          setPageState((old) => ({
            ...old,
            field: sortModel[0]?.field || old.field,
            sort: sortModel[0]?.sort || 'asc',
            page: 1,
          }))
        }
        onRowClick={(e) => setRecordState((old) => ({ ...old, id: e.id }))}
      />
      <GlobalStyles
        styles={{
          '#results-tabpanel-0 .MuiDataGrid-root': {
            height: 'calc(100vh - 284px)',
          },
          '.MuiDataGrid-footerContainer': {
            // backgroundColor: '#fff', // '#D6EFFE',
            backgroundColor: theme.palette.success.light,
            border: '1px solid rgba(224, 224, 224, 1)',
            borderRadius: '4px',
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: 0, // <-- KEY
            zIndex: 3,
            position: 'fixed',
            width: '100%',
          },
        }}
      />
    </>
  )
}

export default DataTable

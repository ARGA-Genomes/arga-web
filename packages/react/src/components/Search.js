import {
  AppBar,
  Box,
  Container,
  Stack,
  Chip,
  Snackbar,
  IconButton,
  GlobalStyles,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { DataGrid } from '@mui/x-data-grid'
import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import stringHash from 'string-hash'
import RecordDrawer from './RecordDrawer'
import ArgaToolbar from './ArgaToolbar'
import FacetsBar from './FacetsBar'

/*
 * ToDo list
 * - add autocomplete to search input (http://namematching-ws.ala.org.au/api/autocomplete?q=Clitocybe%20o&max=10&includeSynonyms=true)
 * - add facet widgets on search row
 * x allow mulitple `fq` params to be set (use an array)
 * - add links to NCBI and ALA resources
 * - pull in photos from ALA BIE
 * - add DNA background image to header bar
 * x fix showing/hiding columns widget
 * - put seach stats at the top (count etc) and make bottom bar pagination use pages jumps (see https://mui.com/x/react-data-grid/style/#custom-theme))
 * x add exception handling for AJAX calls so user knows if query is "bad", etc.
 * - add skeleton images
 * - add an `exclude` list of fields to not show on record drawer
 * x fix bug where user showing hidden column, resets on next render
 * - investigate hosting on AWS Amplify
 * = add `const useStyles = makeStyles((theme) => ({` to style all components
 */

const serverUrlPrefix = 'https://nectar-arga-dev-1.ala.org.au/api'
const defaultQuery = '*:*'
const defaultSort = 'vernacularName'
const facetFields = [
  'speciesGroup',
  'speciesSubgroup',
  'dynamicProperties_ncbi_refseq_category',
  'dynamicProperties_ncbi_genome_rep',
  'dynamicProperties_ncbi_assembly_level',
]
const muiColourCategories = [
  'default',
  'primary',
  'secondary',
  'error',
  'info',
  'success',
  'warning',
]

function getColourForValue(input) {
  const hash =
    stringHash(input + input.split('').reverse().join('*')) %
    muiColourCategories.length
  return muiColourCategories[hash]
}

function Search() {
  const [pageState, setPageState] = useState({
    isLoading: false,
    data: [],
    total: 0,
    page: 1,
    pageSize: 25,
    sort: 'vernacularName',
    order: 'asc',
    q: '',
    fq: [],
    facetResults: [],
    // facet=true&facet.field=dynamicProperties_ncbi_refseq_category
  })

  const [recordState, setRecordState] = useState({
    isLoading: false,
    data: [],
    id: '',
  })

  const [drawerState, setDrawerState] = useState(false)
  const [snackState, setSnackState] = useState({ status: false, message: '' })

  // const { search } = useLocation();
  const [searchParams] = useSearchParams()

  const fqUpdate = useCallback((e) => {
    const fq = `${e.currentTarget.getAttribute('data-fieldname')}:%22${
      e.target.textContent
    }%22`
    setPageState((old) => ({ ...old, fq: [...old.fq, fq], page: 1 }))
    e.stopPropagation()
    e.preventDefault()
  }, [])

  // DataGrid column def
  const columns = useMemo(
    () => [
      {
        field: 'id',
        headerName: 'ID',
        width: 100,
        sortable: false,
        hide: true,
      },
      {
        field: 'score',
        headerName: 'Score',
        width: 100,
        sortable: true,
        hide: true,
      },
      {
        field: 'dynamicProperties_ncbi_assembly_accession',
        headerName: 'NCBI Accession',
        width: 145,
      },
      {
        field: 'raw_scientificName',
        headerName: 'Scientific Name',
        minWidth: 240,
        renderCell: (params) => (
          <span key={params.value}>
            {params.value?.trim().split(/\s+/).length > 1 ? (
              <em>{params.value}</em>
            ) : (
              params.value
            )}
          </span>
        ),
      },
      {
        field: 'scientificName',
        headerName: 'Matched Name',
        minWidth: 240,
        hide: true,
        renderCell: (params) => (
          <span key={params.value}>
            {params.value?.trim().split(/\s+/).length > 1 ? (
              <em>{params.value}</em>
            ) : (
              params.value
            )}
          </span>
        ),
      },
      { field: 'vernacularName', headerName: 'Vernacular Name', width: 190 },
      {
        field: 'speciesGroup',
        headerName: 'Species Groups',
        width: 260,
        sortable: false,
        // valueGetter: ({ value }) => value.join(" | ")
        renderCell: (params) => (
          <Stack direction="row" spacing={1}>
            {params.value?.map((grp) => (
              <Chip
                key={grp}
                label={grp}
                color={getColourForValue(grp)}
                data-fieldname="speciesGroup"
                onClick={fqUpdate}
                size="small"
                variant="outlined"
              />
            ))}
          </Stack>
        ),
      },
      {
        field: 'speciesSubgroup',
        headerName: 'Species Sub-Groups',
        width: 260,
        sortable: false,
        hide: true,
        // valueGetter: ({ value }) => value.join(" | ")
        renderCell: (params) => (
          <Stack direction="row" spacing={1}>
            {params.value?.map((grp) => (
              <Chip
                key={grp}
                label={grp}
                color={getColourForValue(grp)}
                data-fieldname="speciesSubgroup"
                onClick={fqUpdate}
                size="small"
                variant="outlined"
              />
            ))}
          </Stack>
        ),
      },
      {
        field: 'dynamicProperties_ncbi_refseq_category',
        headerName: 'RefSeq Category',
        width: 200,
        valueGetter: ({ value }) => (value === 'na' ? '' : value),
        renderCell: (params) =>
          params.value && (
            <Chip
              key={params.value}
              label={params.value}
              color={getColourForValue(params.value)}
              data-fieldname="dynamicProperties_ncbi_refseq_category"
              onClick={fqUpdate}
              size="small"
              variant="outlined"
            />
          ),
      },
      {
        field: 'dynamicProperties_ncbi_genome_rep',
        headerName: "Genome Represent'n",
        width: 160,
        renderCell: (params) =>
          params.value && (
            <Chip
              key={params.value}
              label={params.value}
              color={getColourForValue(params.value)}
              data-fieldname="dynamicProperties_ncbi_genome_rep"
              onClick={fqUpdate}
              size="small"
              variant="outlined"
            />
          ),
      },
      {
        field: 'dynamicProperties_ncbi_assembly_level', // values: "Contig", "Scaffold", "Complete Genome", "Chromosome"
        headerName: 'Assembly Level',
        width: 160,
        renderCell: (params) =>
          params.value && (
            <Chip
              key={params.value}
              label={params.value}
              color={getColourForValue(params.value)}
              data-fieldname="dynamicProperties_ncbi_assembly_level"
              onClick={fqUpdate}
              size="small"
              variant="outlined"
            />
          ),
      },
      {
        field: 'eventDate',
        headerName: 'Date',
        type: 'dateTime',
        valueGetter: ({ value }) =>
          value && new Date(value).toISOString().substring(0, 10),
        width: 120,
      },
    ],
    [fqUpdate, getColourForValue]
  )

  // array of fields to request from SOLR
  const columnDataFields = useMemo(
    () => columns.map((el) => el.field),
    [columns]
  )

  // Fetch list of records - SOLR select
  useEffect(() => {
    const fetchData = async () => {
      setPageState((old) => ({ ...old, isLoading: true }))
      const startIndex =
        pageState.page * pageState.pageSize - pageState.pageSize
      const response = await fetch(
        `${serverUrlPrefix}/select?q=${
          pageState.q || defaultQuery
        }&fq=${pageState.fq.join('&fq=')}&fl=${columnDataFields.join(
          ','
        )}&facet=true&facet.field=${facetFields.join(
          '&facet.field='
        )}&facet.mincount=1&&rows=${
          pageState.pageSize
        }&start=${startIndex}&sort=${pageState.sort}+${pageState.order}`
      )
      const json = await response.json()
      setPageState((old) => ({
        ...old,
        isLoading: false,
        data: json.response.docs,
        total: json.response.numFound,
        facetResults: json.facet_counts.facet_fields,
      }))
    }
    fetchData().catch((error) => {
      setPageState((old) => ({
        ...old,
        isLoading: false,
      }))
      const msg = `Oops something went wrong. ${error.message}`
      setSnackState({ status: true, message: msg })
    })
  }, [
    pageState.page,
    pageState.pageSize,
    pageState.sort,
    pageState.order,
    pageState.q,
    pageState.fq,
    columnDataFields,
  ])

  // Fetch a single record - SOLR get
  useEffect(() => {
    if (recordState.id) {
      const fetchRecord = async () => {
        setRecordState((old) => ({ ...old, isLoading: true }))
        const resp = await fetch(`${serverUrlPrefix}/get?id=${recordState.id}`)
        const json = await resp.json()
        setRecordState((old) => ({ ...old, isLoading: false, data: json.doc }))
        setDrawerState(true)
      }
      fetchRecord().catch((error) => {
        setPageState((old) => ({
          ...old,
          isLoading: false,
        }))
        const msg = `Oops something went wrong. ${error.message}`
        setSnackState({ status: true, message: msg })
      })
    }
  }, [recordState.id])

  // Listen for `?q={query}` URL (linked search)
  useEffect(() => {
    if (searchParams.get('q')) {
      setPageState((old) => ({ ...old, q: searchParams.get('q') }))
    }
  }, [searchParams])

  // keeping this in for next refactor
  // eslint-disable-next-line
  const searchKeyPress = (e) => {
    if (e.key === 'Enter') {
      setPageState((old) => ({ ...old, q: e.target.value, fq: '', page: 1 }))
      // datagridRef.current.focus()
      // e.preventDefault()
    }
  }

  const rowClicked = (e) => setRecordState((old) => ({ ...old, id: e.id }))

  const toggleDrawer = () => {
    if (drawerState) setRecordState((old) => ({ ...old, id: '' })) // so clicking on same record makes drawer open
    setDrawerState(!drawerState)
  }

  const stepRecord = (id, direction) => {
    if (id && direction) {
      const idList = pageState.data.map((it) => it.id)
      const idPosition = idList.indexOf(id)
      const newidPosition =
        direction === 'next' ? idPosition + 1 : idPosition - 1
      if (idList[newidPosition] !== undefined) {
        setRecordState((old) => ({ ...old, id: idList[newidPosition] }))
      } else {
        setSnackState({
          message: 'No more records to show!',
          status: true,
        })
      }
    }
  }

  const handleSnackClose = () => {
    setSnackState({
      message: '',
      status: false,
    })
  }

  const snackbarAction = (
    <IconButton
      size="small"
      aria-label="close"
      color="inherit"
      onClick={handleSnackClose}
    >
      <CloseIcon fontSize="small" />
    </IconButton>
  )

  const datagridRef = useRef(null)

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar>
        <ArgaToolbar />
      </AppBar>
      <Container
        style={{
          marginTop: 70,
          marginBottom: 74,
          minWidth: '100%',
          height: 'calc(10vh - 74px)',
        }}
        maxWidth="lg"
      >
        <RecordDrawer
          drawerState={drawerState}
          toggleDrawer={toggleDrawer}
          recordState={recordState}
          stepRecord={stepRecord}
        />
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          open={snackState.status}
          onClose={handleSnackClose}
          autoHideDuration={4000}
          action={snackbarAction}
          message={snackState.message}
        />
        {/* <Box flex={4} p={{ xs: 0, md: 2 }}> */}
        <Box
          sx={{
            // width: 500,
            margin: '15px 0',
            maxWidth: '100%',
            backgroundColor: 'white',
            // height: 'calc(100% - 54px)'
          }}
        >
          <div
            style={{
              width: '100%',
              height: 'calc(100vh - 248px)',
              background: '#E0E0E0',
            }}
          >
            <FacetsBar
              pageState={pageState}
              setPageState={setPageState}
              searchKeyPress={searchKeyPress}
            />
            <DataGrid
              // components={{
              //   Toolbar: GridToolbar
              // }}
              autoHeight={false}
              disableSelectionOnClick
              rowHeight={40}
              ref={datagridRef}
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
              onPageChange={(newPage) =>
                setPageState((old) => ({ ...old, page: newPage + 1 }))
              }
              onPageSizeChange={(newPageSize) =>
                setPageState((old) => ({ ...old, pageSize: newPageSize }))
              }
              onSortModelChange={(sortModel) =>
                setPageState((old) => ({
                  ...old,
                  sort: sortModel[0]?.field || defaultSort,
                  order: sortModel[0]?.sort || 'asc',
                  page: 1,
                }))
              }
              onRowClick={rowClicked}
            />
          </div>
          {/* </Box> */}
          {/* ToDo put this in a custom styled component */}
          <GlobalStyles
            styles={{
              '.MuiDataGrid-footerContainer': {
                backgroundColor: '#fff', // '#D6EFFE',
                border: '1px solid rgba(224, 224, 224, 1)',
                borderRadius: '4px',
                left: '50%',
                transform: 'translateX(-50%)',
                bottom: 0, // <-- KEY
                zIndex: 3,
                position: 'fixed',
                width: 'calc(100% - 48px)',
              },
            }}
          />
        </Box>
      </Container>
    </Box>
  )
}

export default Search

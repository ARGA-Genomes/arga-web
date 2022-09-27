import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Box,
  Stack,
  Chip,
  Snackbar,
  IconButton,
  Grid,
  Tab,
  Tabs,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import stringHash from 'string-hash'
import RecordDrawer from './RecordDrawer'
// import ArgaToolbar from './ArgaToolbar'
import FacetsBar from './FacetsBar'
import GridView from './GridView'
import DataTable from './DataTable'
import MapView from './MapView'
import theme from './theme'

/*
 * ToDo list
 * - Moved into https://github.com/ARGA-Genomes/arga-web/issues/4
 */

const serverUrlPrefix = 'https://nectar-arga-dev-1.ala.org.au/api'
const defaultQuery = '*:*'
// const defaultSort = 'vernacularName'
const facetFields = [
  'dataResourceName',
  'speciesGroup',
  'speciesSubgroup',
  'matchType',
  'country',
  'stateProvince',
  'biome',
  'speciesListUid',
  'dynamicProperties_ncbi_refseq_category',
  'dynamicProperties_ncbi_genome_rep',
  'dynamicProperties_ncbi_assembly_level',
  'dynamicProperties_bpa_resource_permissions',
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
const additionalFields = ['taxonConceptID', 'matchType']

function getColourForValue(input) {
  const hash =
    // change the character inside `join()` to expirement with which colours look better
    stringHash(input + input.split('').reverse().join('/')) %
    muiColourCategories.length
  return muiColourCategories[hash]
}

function ValueTag({ value, label, field, fqUpdate }) {
  const chipLabel = label || value
  return (
    <Chip
      label={chipLabel}
      color={getColourForValue(chipLabel)}
      data-fieldname={field}
      data-value={value}
      onClick={fqUpdate}
      size="small"
      variant="outlined"
    />
  )
}

function TabPanel({ children, value, index }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`results-tabpanel-${index}`}
      aria-labelledby={`results-tab-${index}`}
    >
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  )
}

/**
 * Search component
 *
 * @returns JSX
 */
function Search() {
  const [pageState, setPageState] = useState({
    isLoading: false,
    data: [],
    species: [],
    total: 0,
    page: 1,
    pageSize: 25,
    field: 'vernacularName', // sort
    sort: 'asc', // order
    q: '',
    // Note: `fq` is in its own state var below (`fqState`)
    groupResults: false,
    facetResults: [],
  })

  const [fqState, setFqState] = useState({})
  const fqRef = useRef()
  fqRef.current = fqState // so `fqState` can be read in callbacks (normally `fqState` is always empty in `fqUpdate`)

  const [recordState, setRecordState] = useState({
    isLoading: false,
    data: [],
    id: '',
    speciesIndex: 0,
  })

  const [drawerState, setDrawerState] = useState(false)
  const [snackState, setSnackState] = useState({ status: false, message: '' })

  // Tabs state
  const defaultTabIndex = 1 // which tab is shown on first page load (zero-indexed array)
  const [tabValue, setTabValue] = useState(defaultTabIndex)
  const handleTabChange = (event, newValue) => {
    // if (newValue === 0) {
    //   setPageState((old) => ({
    //     ...old,
    //     groupResults: false,
    //     page: 1,
    //     pageSize: 25,
    //   }))
    // } else if (newValue === 1) {
    //   setPageState((old) => ({
    //     ...old,
    //     groupResults: true,
    //     page: 1,
    //     pageSize: 24,
    //   }))
    // }
    setTabValue(newValue)
  }

  // const { search } = useLocation();
  const [searchParams] = useSearchParams()

  /**
   * Callback attached to Chip elements in the results table of datagrid.
   * Triggers new search with `fq` param added for given Chip.
   */
  const fqUpdate = useCallback((e) => {
    const fieldName = e.currentTarget.getAttribute('data-fieldname')
    const value = e.currentTarget.getAttribute('data-value')
    const existingValues =
      fqRef.current[fieldName]?.length > 0 ? fqRef.current[fieldName] : []
    const fq = { [fieldName]: [...existingValues, value] }
    setFqState((old) => ({ ...old, ...fq }))
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
        field: 'occurrenceID',
        headerName: 'Accession',
        width: 145,
      },
      {
        field: 'dataResourceName',
        headerName: 'Dataset',
        width: 100,
        renderCell: (params) =>
          params.value && (
            <ValueTag
              value={params.value}
              label={params.value?.replace('NCBI Genome ', '')}
              field="dataResourceName"
              fqUpdate={fqUpdate}
            />
          ),
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
        renderCell: (params) => (
          <Stack direction="row" spacing={1}>
            {params.value?.map((grp) => (
              <ValueTag
                key={grp}
                value={grp}
                field="speciesGroup"
                fqUpdate={fqUpdate}
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
        renderCell: (params) => (
          <Stack direction="row" spacing={1}>
            {params.value?.map((grp) => (
              <ValueTag
                key={grp}
                value={grp}
                field="speciesSubgroup"
                fqUpdate={fqUpdate}
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
            <ValueTag
              value={params.value}
              field="dynamicProperties_ncbi_refseq_category"
              fqUpdate={fqUpdate}
            />
          ),
      },
      {
        field: 'dynamicProperties_ncbi_genome_rep',
        headerName: "Genome Represent'n",
        width: 160,
        renderCell: (params) =>
          params.value && (
            <ValueTag
              value={params.value}
              field="dynamicProperties_ncbi_genome_rep"
              fqUpdate={fqUpdate}
            />
          ),
      },
      {
        field: 'dynamicProperties_ncbi_assembly_level', // values: "Contig", "Scaffold", "Complete Genome", "Chromosome"
        headerName: 'Assembly Level',
        width: 160,
        renderCell: (params) =>
          params.value && (
            <ValueTag
              value={params.value}
              field="dynamicProperties_ncbi_assembly_level"
              fqUpdate={fqUpdate}
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
    () => columns.map((el) => el.field).concat(additionalFields),
    [columns]
  )

  // Fetch list of records - SOLR select
  useEffect(() => {
    const abortController = new AbortController() // if mulitple record requests - last one wins

    const fetchData = async () => {
      setPageState((old) => ({
        ...old,
        isLoading: true,
        // data: [],
        // species: [],
      }))
      // calculate SOLR startIndex param
      const startIndex =
        pageState.page * pageState.pageSize - pageState.pageSize
      // Build `fq` params
      const fqParamList = []
      Object.keys(fqState).forEach((key) => {
        if (fqState[key].length > 0) {
          // array in object value
          fqState[key].forEach((val) => {
            fqParamList.push(`${key}:%22${val}%22`)
          })
        } else {
          // empty value in object ()
          fqParamList.push(key)
        }
      })
      const groupParams = pageState.groupResults
        ? '&group=true&group.field=scientificName&group.limit=99'
        : ''
      const url = `${serverUrlPrefix}/select?q=${
        pageState.q || defaultQuery
      }&fq=${fqParamList.join('&fq=')}&fl=${columnDataFields.join(
        ','
      )}&facet=true&facet.field=${facetFields.join(
        '&facet.field='
      )}&facet.mincount=1&&rows=${
        pageState.pageSize
      }&start=${startIndex}&sort=${pageState.field}+${
        pageState.sort
      }${groupParams}`

      // Do HTTP fetch
      const response = await fetch(url, { signal: abortController.signal })
      // wait for async response
      const json = await response.json()
      setPageState((old) => ({
        ...old,
        isLoading: false,
        data: pageState.groupResults ? {} : json.response.docs,
        species: pageState.groupResults
          ? json.grouped.scientificName.groups
          : [],
        total: pageState.groupResults
          ? json.grouped.scientificName.matches
          : json.response.numFound,
        facetResults: json.facet_counts.facet_fields,
      }))
      if (drawerState) {
        // if drawer is open, reset record ID to be first in results
        setRecordState((old) => ({ ...old, id: json.response.docs[0].id }))
      }
    }
    fetchData().catch((error) => {
      setPageState((old) => ({
        ...old,
        isLoading: false,
      }))
      const msg = `Oops something went wrong. ${error.message}`
      setSnackState({ status: true, message: msg })
    })

    return () => {
      abortController.abort()
    }
  }, [
    pageState.page,
    pageState.pageSize,
    pageState.field,
    pageState.sort,
    pageState.q,
    pageState.groupResults,
    fqState,
    columnDataFields,
  ])

  // Fetch a single record - SOLR get
  // ToDo move to RecordDrawer component along with state vars
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
      setPageState((old) => ({ ...old, q: e.target.value, page: 1 }))
      setFqState({})
      // datagridRef.current.focus()
      // e.preventDefault()
    }
  }

  const toggleDrawer = () => {
    if (drawerState) setRecordState((old) => ({ ...old, id: '' })) // so clicking on same record makes drawer open
    setDrawerState(!drawerState)
  }

  const stepRecord = (id, direction) => {
    if (id && direction) {
      const idList = pageState.groupResults
        ? pageState.species[recordState.speciesIndex].doclist.docs.map(
            (it) => it.id
          )
        : pageState.data.map((it) => it.id)
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

  // const datagridRef = useRef(null) // Not sure this is needed?

  return (
    // <Box sx={{ display: 'flex' }}>
    //   <ArgaToolbar />
    <Grid
      style={{
        marginTop: 62,
        marginBottom: 72,
        minWidth: '100%',
        height: 'calc(10vh - 72px)',
      }}
      // maxWidth="lg"
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
          width: '100%',
          backgroundColor: 'white',
          // height: 'calc(100% - 54px)'
        }}
      >
        <div
          style={{
            width: '100%',
            height: 'calc(100vh - 284px)',
            background: '#E0E0E0',
          }}
        >
          <FacetsBar
            pageState={pageState}
            setPageState={setPageState}
            searchKeyPress={searchKeyPress}
            fqState={fqRef.current || {}}
            setFqState={setFqState}
          />
          <Box sx={{ width: '100%', background: 'white' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                textColor="secondary"
                indicatorColor="secondary"
                aria-label="Navigation tabs for search results"
              >
                <Tab
                  label="Table"
                  id="results-tab-0"
                  aria-controls="results-tabpanel-0"
                />
                <Tab
                  label="Grid"
                  id="results-tab-1"
                  aria-controls="results-tabpanel-1"
                />
                <Tab
                  label="Map"
                  id="results-tab-2"
                  aria-controls="results-tabpanel-2"
                />
              </Tabs>
            </Box>
            <TabPanel value={tabValue} index={0}>
              <DataTable
                columns={columns}
                pageState={pageState}
                setPageState={setPageState}
                setRecordState={setRecordState}
              />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <Box
                sx={{
                  flexGrow: 1,
                  p: 2,
                  backgroundColor: theme.palette.warning.light,
                }}
              >
                <GridView
                  pageState={pageState}
                  setPageState={setPageState}
                  setRecordState={setRecordState}
                />
              </Box>
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              <Box
                sx={{
                  flexGrow: 1,
                  p: 2,
                }}
              >
                <MapView
                  pageState={pageState}
                  setPageState={setPageState}
                  setDrawerState={setDrawerState}
                  fqState={fqState}
                  setFqState={setFqState}
                  setRecordState={setRecordState}
                />
              </Box>
            </TabPanel>
          </Box>
        </div>
        {/* </Box> */}
      </Box>
    </Grid>
    // </Box>
  )
}

export default Search

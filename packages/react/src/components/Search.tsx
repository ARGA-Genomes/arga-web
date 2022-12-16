import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
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
import fetchSequences from '../fetchers/sequences'
import config from '../config/global-conf'

/* tslint:disable */
const FacetsBarT: any = FacetsBar // todo delete me after refactoring to TS
/* tslint:enable */

// Config variables
// TODO: move into `config.js` if likely needing to be tweaked
const serverUrlPrefix: any = config.solr_uri
// const defaultQuery = '*:*'
// const queryParser = 'edismax'
// // instead of `AND` being default operator, specify how many terms must match (minimum)
// const minMatch = '3' // fixes accession number searches (e.g. `GCF_002099425.1` which get tokenised into 3 parts)
// // fields used when no field is specified, similar to default field
// const queryFields: Record<string, any> = {
//   text: '1.0',
//   scientificName: '5.0',
//   raw_scientificName: '2.0',
//   vernacularName: '5.0',
//   dynamicProperties_ncbi_biosample_attributes_json: '1.0',
//   otherCatalogNumbers: '1.0',
// }
// // Boost (sub) queries for these field:value pairs with boost factor
// const boostQuery: string[] = [
//   'kingdom:Animalia^2.0', // prefer animals pver bacteria, etc. (normally appear first)
//   'class:Mammalia^2.0', // prefer mammals
//   'country:Australia^4.0',
//   'vernacularName:*^2.0', // docs with common names get boosted
//   'matchType:exactMatch^10.0', // results in ALA backbone taxa getting boosted
//   'dataResourceUid:dr18509^8.0', // NCBI refseq
//   'dataResourceUid:dr18540^6.0', // NCBI genome
//   'dataResourceUid:dr18544^4.0', // BPA
//   'dataResourceUid:dr375^1.0', // BOLD
//   // Assembly level boost
//   'dynamicProperties_MIXS_0000005:"Complete Genome"^6.0',
//   'dynamicProperties_MIXS_0000005:Chromosome^6.0',
//   'dynamicProperties_MIXS_0000005:Contig^4.0',
//   'dynamicProperties_MIXS_0000005:Scaffold^2.0',
// ]

// Config Object for formatting filter drop-downs
// TODO: Move into config file and refactor to be "less complex"
const facetFields: Record<string, any> = {
  dataResourceName: { tag: 'dr', label: 'data source' },
  speciesGroup: { tag: 'sg', label: null },
  speciesSubgroup: { tag: 'ss', label: null },
  matchType: { tag: 'mt', label: null },
  country: { tag: 'co', label: null },
  stateProvince: { tag: 'sp', label: null },
  biome: { tag: 'bi', label: null },
  //  speciesListUid: {tag: '', label: null},
  countryConservation: { tag: 'cc', label: 'EPBC Conservation status' },
  stateConservation: { tag: 'sc', label: 'State Conservation status' },
  //  stateInvasive: {tag: '', label: null},
  //  dynamicProperties_ncbi_refseq_category: {tag: '', label: null},
  dynamicProperties_ncbi_genome_rep: {
    tag: 'gr',
    label: 'NCBI genome representation',
  },
  dynamicProperties_MIXS_0000005: {
    tag: 'al',
    label: 'Assembly level',
  },
  dynamicProperties_bpa_resource_permissions: {
    tag: 'rp',
    label: 'BPA access permissions',
  },
}

const muiColourCategories: any = [
  'default',
  'primary',
  'secondary',
  'error',
  'info',
  'success',
  'warning',
]

const additionalFields = ['taxonConceptID', 'matchType']

function getColourForValue(input: string) {
  const hash =
    // change the character inside `join()` to expirement with which colours look better
    stringHash(input + input.split('').reverse().join('/')) %
    muiColourCategories.length
  return muiColourCategories[hash]
}

interface ValueTagType {
  value: string
  label?: string
  field: string
  fqUpdate: any
}

function ValueTag({ value, label, field, fqUpdate }: ValueTagType) {
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

interface TabType {
  value: string | number | undefined
  index: number
  children: React.ReactNode
}

function TabPanel({ children, value, index }: TabType) {
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

interface SolrParams {
  isLoading: boolean
  q: string
  page: number
  pageSize: number
  // total: number
  field?: string
  sort?: string
  groupResults: boolean
  // facetResults?: string[]
  species?: any
  data?: any
}

/**
 * Search component
 *
 * @returns JSX
 */
function Search() {
  const [pageState, setPageState] = useState<SolrParams>({
    isLoading: false,
    // data: [],
    // species: [],
    // total: 0,
    page: 1,
    pageSize: 24,
    field: '', // sort 'vernacularName'
    sort: '', // order 'asc'
    q: '',
    // Note: `fq` is in its own state var below (`fqState`)
    groupResults: true,
    // facetResults: [],
  })

  const [fqState, setFqState] = useState<{ [key: string]: any }>({})
  const fqRef: React.MutableRefObject<any> = useRef()
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
  const handleTabChange = (_event: any, newValue: any) => {
    setTabValue(newValue)
  }

  // const [page, setPage] = React.useState(0)

  interface SolrResults {
    docs?: any | undefined
    species?: any | undefined
    total?: number
    facetResults?: any | undefined
  }

  const solrData: SolrResults = {
    total: 0,
    docs: [],
    species: [],
  }

  // const { status, data, error, isFetching, isPreviousData } = useQuery({
  const query = useQuery({
    queryKey: ['sequences', pageState],
    queryFn: () => fetchSequences(pageState, columnDataFields, fqState),
    keepPreviousData: true,
    staleTime: 5000,
  })

  // massage the data into either docs or species
  if (query.data) {
    if (query.data.response?.docs) {
      solrData.docs = query.data.response.docs
      solrData.total = query.data.response.numFound
    } else if (query.data.grouped?.scientificName?.groups) {
      solrData.species = query.data.grouped.scientificName.groups
      solrData.total = query.data.grouped.scientificName.matches
    }

    if (query.data.facet_counts?.facet_fields) {
      solrData.facetResults = query.data.facet_counts.facet_fields
    }
  }

  console.log('query objext', query)
  console.log('query data', query.data)
  console.log('solrData', solrData)
  // const { search } = useLocation();
  const [searchParams] = useSearchParams()

  /**
   * Callback attached to Chip elements in the results table of datagrid.
   * Triggers new search with `fq` param added for given Chip.
   */
  const fqUpdate = useCallback((e: any) => {
    const fieldName = e.currentTarget.getAttribute('data-fieldname')
    const value = e.currentTarget.getAttribute('data-value')
    const existingValues =
      fqRef.current[fieldName]?.length > 0 ? fqRef.current[fieldName] : []
    const fq = { [fieldName]: [...existingValues, value] }
    setFqState((old) => ({ ...old, ...fq }))
    e.stopPropagation()
    e.preventDefault()
  }, [])

  /**
   * Build string for SOLR `fq` params
   *  input  => {"dataResourceName":["NCBI Genome Genbank","NCBI Genome RefSeq"],"country":["Australia"]}
   *  output => fq={!tag=co}country:%22Australia%22&fq={!tag=dr}dataResourceName:%22NCBI%20Genome%20RefSeq%22+OR+dataResourceName:%22NCBI%20Genome%20Genbank%22
   */
  // const buildFqList = useCallback(() => {
  //   const fqParamList: string[] = []

  //   Object.keys(fqState).forEach((key) => {
  //     const tag = facetFields[key]?.tag ? `{!tag=${facetFields[key].tag}}` : ''
  //     // const numberOfDupeKeys = fqState.indexOf(key)
  //     if (fqState[key].length > 0) {
  //       // array in object value
  //       fqParamList.push(
  //         `${tag}${key}:%22${fqState[key].join(`%22+OR+${key}:%22`)}%22`
  //       )
  //     } else {
  //       // empty value in object ()
  //       fqParamList.push(`${tag}${key}`)
  //     }
  //   })

  //   return fqParamList.join('&fq=')
  // }, [fqState])

  /**
   * Build string for SOLR `facet.field` params.
   */
  // const buildFacetList = useCallback(() => {
  //   const facetList: string[] = []
  //   Object.keys(facetFields).forEach((field) => {
  //     const tag = facetFields[field]?.tag
  //       ? `{!ex=${facetFields[field].tag}}`
  //       : ''
  //     facetList.push(`${tag}${field}`)
  //   })
  //   return facetList
  // }, [facetFields])

  // DataGrid column def
  // TODO: move into config file
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
        renderCell: (params: Record<string, any>) =>
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
        renderCell: (params: Record<string, any>) => (
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
        renderCell: (params: Record<string, any>) => (
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
        renderCell: (params: Record<string, any>) => (
          <Stack direction="row" spacing={1}>
            {params.value?.map((grp: string) => (
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
        renderCell: (params: Record<string, any>) => (
          <Stack direction="row" spacing={1}>
            {params.value?.map((grp: string) => (
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
        valueGetter: ({ value }: any) => (value === 'na' ? '' : value),
        renderCell: (params: Record<string, any>) =>
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
        renderCell: (params: Record<string, any>) =>
          params.value && (
            <ValueTag
              value={params.value}
              field="dynamicProperties_ncbi_genome_rep"
              fqUpdate={fqUpdate}
            />
          ),
      },
      {
        field: 'dynamicProperties_MIXS_0000005', // values: "Contig", "Scaffold", "Complete Genome", "Chromosome"
        headerName: 'Assembly Level',
        width: 160,
        renderCell: (params: Record<string, any>) =>
          params.value && (
            <ValueTag
              value={params.value}
              field="dynamicProperties_MIXS_0000005"
              fqUpdate={fqUpdate}
            />
          ),
      },
      {
        field: 'eventDate',
        headerName: 'Date',
        type: 'dateTime',
        valueGetter: ({ value }: any) =>
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

  // // Fetch list of records - SOLR select
  // useEffect(() => {
  //   const abortController = new AbortController() // if mulitple record requests - last one wins

  //   const fetchData = async () => {
  //     setPageState((old) => ({
  //       ...old,
  //       isLoading: true,
  //     }))
  //     // calculate SOLR startIndex param
  //     const startIndex =
  //       pageState.page * pageState.pageSize - pageState.pageSize
  //     const groupParams = pageState.groupResults
  //       ? '&group=true&group.field=scientificName&group.limit=99'
  //       : ''
  //     const query = pageState.q || defaultQuery
  //     const url = `${serverUrlPrefix}/select?q=${query}&fq=${buildFqList()}&fl=${columnDataFields.join(
  //       ','
  //     )}&facet=true&facet.field=${buildFacetList().join(
  //       '&facet.field='
  //     )}&facet.mincount=1&&rows=${
  //       pageState.pageSize
  //     }&start=${startIndex}&sort=${
  //       pageState.field ? `${pageState.field}+${pageState.sort}` : ''
  //     }${groupParams}&defType=${queryParser}&qf=${Object.keys(queryFields)
  //       .map((k) => `${k}^${queryFields[k]}`)
  //       .join('+')}&bq=${boostQuery.join('+')}&mm=${minMatch}&debugQuery=true`

  //     // Do HTTP fetch
  //     const response = await fetch(url, { signal: abortController.signal })
  //     // wait for async response
  //     const json = await response.json()
  //     setPageState((old) => ({
  //       ...old,
  //       isLoading: false,
  //       data: pageState.groupResults ? {} : json.response.docs,
  //       species: pageState.groupResults
  //         ? json.grouped.scientificName.groups
  //         : [],
  //       total: pageState.groupResults
  //         ? json.grouped.scientificName.matches
  //         : json.response.numFound,
  //       facetResults: json.facet_counts.facet_fields,
  //     }))
  //     if (drawerState) {
  //       // if drawer is open, reset record ID to be first in results
  //       setRecordState((old) => ({ ...old, id: json.response.docs[0].id }))
  //     }
  //   }
  //   fetchData().catch((error) => {
  //     setPageState((old) => ({
  //       ...old,
  //       isLoading: false,
  //     }))
  //     const msg = `Oops something went wrong. ${error.message}`
  //     setSnackState({ status: true, message: msg })
  //   })

  //   return () => {
  //     abortController.abort()
  //   }
  // }, [
  //   pageState.page,
  //   pageState.pageSize,
  //   pageState.field,
  //   pageState.sort,
  //   pageState.q,
  //   pageState.groupResults,
  //   fqState,
  //   columnDataFields,
  // ])

  // Fetch a single record - SOLR get
  // TODO: move to RecordDrawer component along with state vars
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
      setPageState((old: any) => ({ ...old, q: searchParams.get('q') }))
    }
  }, [searchParams])

  // keeping this in for next refactor
  // eslint-disable-next-line
  const searchKeyPress = (e: any) => {
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

  const stepRecord = (id: number, direction: 'next' | 'previous') => {
    if (id && direction) {
      const idList = pageState.groupResults
        ? pageState.species[recordState.speciesIndex].doclist.docs.map(
            (it: any) => it.id
          )
        : pageState.data.map((it: any) => it.id)
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
            height: 'calc(100vh - 324px)',
            background: '#E0E0E0',
          }}
        >
          <FacetsBarT
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
                solrData={solrData}
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
                  solrData={solrData}
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
                  facetFields={facetFields}
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

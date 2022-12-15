import config from '../components/config'

interface SolrQuery {
  [key: string]: any
}

interface facetQuery {
  [key: string]: any
}

// instead of `AND` being default operator, specify how many terms must match (minimum)
const minMatch = '3' // fixes accession number searches (e.g. `GCF_002099425.1` which get tokenised into 3 parts)
// fields used when no field is specified, similar to default field
const queryFields: Record<string, string> = {
  text: '1.0',
  scientificName: '5.0',
  raw_scientificName: '2.0',
  vernacularName: '5.0',
  dynamicProperties_ncbi_biosample_attributes_json: '1.0',
  otherCatalogNumbers: '1.0',
}

const serverUrlPrefix: any = config.solr_uri
const defaultQuery = '*:*'
const queryParser = 'edismax'

// Boost (sub) queries for these field:value pairs with boost factor
const boostQuery: String[] = [
  'kingdom:Animalia^2.0', // prefer animals pver bacteria, etc. (normally appear first)
  'class:Mammalia^2.0', // prefer mammals
  'country:Australia^4.0',
  'vernacularName:*^2.0', // docs with common names get boosted
  'matchType:exactMatch^10.0', // results in ALA backbone taxa getting boosted
  'dataResourceUid:dr18509^8.0', // NCBI refseq
  'dataResourceUid:dr18540^6.0', // NCBI genome
  'dataResourceUid:dr18544^4.0', // BPA
  'dataResourceUid:dr375^1.0', // BOLD
  // Assembly level boost
  'dynamicProperties_MIXS_0000005:"Complete Genome"^6.0',
  'dynamicProperties_MIXS_0000005:Chromosome^6.0',
  'dynamicProperties_MIXS_0000005:Contig^4.0',
  'dynamicProperties_MIXS_0000005:Scaffold^2.0',
]

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

/**
   * Build string for SOLR `fq` params
   *  input  => {"dataResourceName":["NCBI Genome Genbank","NCBI Genome RefSeq"],"country":["Australia"]}
   *  output => fq={!tag=co}country:%22Australia%22&fq={!tag=dr}dataResourceName:%22NCBI%20Genome%20RefSeq%22+OR+dataResourceName:%22NCBI%20Genome%20Genbank%22
   */
 const buildFqList = (fqState: facetQuery) => {
  const fqParamList: any[] = [];

  Object.keys(fqState).forEach((key) => {
    const tag = facetFields[key]?.tag ? `{!tag=${facetFields[key].tag}}` : ''
    // const numberOfDupeKeys = fqState.indexOf(key)
    if (fqState[key].length > 0) {
      // array in object value
      fqParamList.push(
        `${tag}${key}:%22${fqState[key].join(`%22+OR+${key}:%22`)}%22`
      )
    } else {
      // empty value in object ()
      fqParamList.push(`${tag}${key}`)
    }
  })

  const fqParamString: String = fqParamList.join('&fq=')

  return fqParamString
}

/**
 * Build string for SOLR `facet.field` params.
 */
const buildFacetList = () => {
  const facetList: String[] = []
  Object.keys(facetFields).forEach((field) => {
    const tag: String = facetFields[field]?.tag
      ? `{!ex=${facetFields[field].tag}}`
      : ''
    facetList.push(`${tag}${field}`)
  })
  return facetList
}

// const fetchSequences = async (queryObj: SolrQuery, columnDataFields: String[]) => {
async function fetchSequences(queryObj: SolrQuery, columnDataFields: String[], fqState: Record<string, any>) {
  console.log("Fetching sequences");
  const startIndex: number =
  queryObj.page * queryObj.pageSize - queryObj.pageSize
  const groupParams = queryObj.groupResults
    ? '&group=true&group.field=scientificName&group.limit=99'
    : ''
  const query = queryObj.q || defaultQuery
  const url = `${serverUrlPrefix}/select?q=${query}&fq=${buildFqList(fqState)}&fl=${columnDataFields.join(
    ','
  )}&facet=true&facet.field=${buildFacetList().join(
    '&facet.field='
  )}&facet.mincount=1&&rows=${
    queryObj.pageSize
  }&start=${startIndex}&sort=${
    queryObj.field ? `${queryObj.field}+${queryObj.sort}` : ''
  }${groupParams}&defType=${queryParser}&qf=${Object.keys(queryFields)
    .map((k) => `${k}^${queryFields[k]}`)
    .join('+')}&bq=${boostQuery.join('+')}&mm=${minMatch}&debugQuery=true`

  // Do HTTP fetch
  const response = await fetch(url)
  // wait for async response
  const json = await response.json()
  return json
}

export default fetchSequences
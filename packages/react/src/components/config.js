// URLs
const externalUrls = {
  BIE: 'https://bie.ala.org.au/species/',
  BIOCACHE: 'https://biocache.ala.org.au/occurrences/',
  NCBI: 'https://www.ncbi.nlm.nih.gov',
  NCBI_DOWNLOAD: 'https://api.ncbi.nlm.nih.gov/datasets/v2alpha',
  BPA: 'https://data.bioplatforms.com/dataset/',
  BOLD: 'https://www.boldsystems.org/index.php',
  AUS_TRAITS:
    'https://traitecoevo.github.io/austraits.build/articles/trait_definitions.html#',
}

externalUrls.NCBI_GENOME = `${externalUrls.NCBI}/data-hub/genome/`
externalUrls.NCBI_BIOSAMPLE = `${externalUrls.NCBI}/biosample/`
externalUrls.NCBI_BIOPROJECT = `${externalUrls.NCBI}/bioproject/`
externalUrls.BOLD_BIN = `${externalUrls.BOLD}/Public_RecordView?processid=`
externalUrls.BOLD_FASTA = `${externalUrls.BOLD}/API_Public/sequence?ids=`
externalUrls.BIOCACHE_CAT_NO = `${externalUrls.BIOCACHE}search?q=`

const config = {
  // authority: import.meta.env.VITE_OIDC_AUTHORITY,
  // client_id: import.meta.env.VITE_OIDC_CLIENT_ID,
  // redirect_uri: import.meta.env.VITE_OIDC_REDIRECT_URI,
  authority: process.env.REACT_APP_OIDC_AUTHORITY,
  client_id: process.env.REACT_APP_OIDC_CLIENT_ID,
  redirect_uri: process.env.REACT_APP_OIDC_REDIRECT_URI,
  solr_uri: process.env.REACT_APP_SOLR_SERVER_URI,
  dr_codes: {
    DR_REFSEQ: 'dr18509',
    DR_GENBANK: 'dr18541',
    DR_BPA: 'dr18544',
    DR_BOLD: 'dr375',
  },
  urls: externalUrls,
}

export default config

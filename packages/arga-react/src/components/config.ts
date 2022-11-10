export interface AuthConfig {
  authority: string;
  client_id: string;
  redirect_uri: string;
  solr_uri: string;
  dr_codes: any;
  urls: any;
}

interface Urls {
  [key: string]: any; 
}

// URLs
const externalUrls: Urls = {
  BIE: 'https://bie.ala.org.au/species/',
  BIOCACHE: 'https://biocache.ala.org.au/occurrences/',
  NCBI: 'https://www.ncbi.nlm.nih.gov',
  NCBI_DOWNLOAD: 'https://api.ncbi.nlm.nih.gov/datasets/v1',
  BPA: 'https://data.bioplatforms.com/dataset/',
  BOLD: 'https://www.boldsystems.org/index.php'
};

externalUrls.NCBI_GENOME = `${externalUrls.NCBI}/data-hub/genome/`;
externalUrls.NCBI_BIOSAMPLE = `${externalUrls.NCBI}/biosample/`;
externalUrls.NCBI_BIOPROJECT = `${externalUrls.NCBI}/bioproject/`;
externalUrls.BOLD_BIN = `${externalUrls.BOLD}/Public_RecordView?processid=`;
externalUrls.BOLD_FASTA = `${externalUrls.BOLD}/API_Public/sequence?ids=`;
externalUrls.BIOCACHE_CAT_NO = `${externalUrls.BIOCACHE}search?q=`;

const config: AuthConfig = {
  authority: import.meta.env.VITE_OIDC_AUTHORITY,
  client_id: import.meta.env.VITE_OIDC_CLIENT_ID,
  redirect_uri: import.meta.env.VITE_OIDC_REDIRECT_URI,
  solr_uri: import.meta.env.VITE_APP_SOLR_SERVER_URI,
  dr_codes: {
    DR_REFSEQ: 'dr18509',
    DR_GENBANK: 'dr18541',
    DR_BPA: 'dr18544',
    DR_BOLD: 'dr375'
  },
  urls: externalUrls
};

export default config;
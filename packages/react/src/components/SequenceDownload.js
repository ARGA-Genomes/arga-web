import { Button, Chip, Tooltip } from '@mui/material'
import CloudDownloadIcon from '@mui/icons-material/CloudDownload'
import LockIcon from '@mui/icons-material/Lock'
import config from './config'
import cleanupJsonAndParse from '../utils/parseBpaJson'

const DR_CODES = config.dr_codes
const URLS = config.urls

export default function SequenceDownload({ data, size }) {
  const sequenceList = []

  if (
    data.dataResourceUid === DR_CODES.DR_REFSEQ ||
    data.dataResourceUid === DR_CODES.DR_GENBANK
  ) {
    // NCBI
    const urlPathParams = `/genome/accession/${data.occurrenceID}/download?include_annotation_type=GENOME_GFF,RNA_FASTA,CDS_FASTA,PROT_FASTA&filename=${data.occurrenceID}.zip`
    sequenceList.push({
      url: `${URLS.NCBI_DOWNLOAD}${urlPathParams}`,
      title: 'Download all available sequence files',
      label: 'ZIP archive',
    })
  } else if (data.dataResourceUid === DR_CODES.DR_BOLD) {
    // BOLD
    const id = data.recordNumber || data.materialSampleID || data.fieldNumber
    sequenceList.push({
      url: `${URLS.BOLD_FASTA}${id}`,
      title: 'Download sequence files (fasta format)',
      label: 'FASTA',
    })
  } else if (data.dataResourceUid === DR_CODES.DR_BPA) {
    // BPA
    const bpaList = cleanupJsonAndParse(data.associatedSequences) || []
    bpaList.forEach((seq, i) => {
      sequenceList.push({
        url: seq.url,
        title: `Download sequence files (${seq.format || 'fasta'} format)`,
        label: `${i + 1}. ${seq.format || 'FASTA'}`,
      })
    })
  }

  const btnStyle = {
    padding: size === 'medium' ? '' : '1px 9px 0 8px',
    marginBottom: size === 'medium' ? '10px' : '',
    marginRight: '5px',
    textTransform: 'none',
  }

  return (
    <>
      {sequenceList.map((seq) => (
        <Tooltip title={seq.title} key={seq.url}>
          <Button
            color="primary"
            variant="contained"
            size={size || 'small'}
            style={btnStyle}
            href={seq.url}
            // onClick={() => window.open(seq.url, '_partner')}
            endIcon={size === 'small' && <CloudDownloadIcon />}
            startIcon={size === 'medium' && <CloudDownloadIcon />}
          >
            {size === 'medium' && 'Download: '}
            {seq.label}
          </Button>
        </Tooltip>
      ))}
      {data.dynamicProperties_bpa_resource_permissions &&
        data.dynamicProperties_bpa_resource_permissions !== 'public' && (
          <Chip
            icon={<LockIcon />}
            style={btnStyle}
            label={`Access: ${
              data.dynamicProperties_bpa_resource_permissions.split(':')[0]
            }`}
            variant="outlined"
            size={size || 'small'}
          />
        )}
    </>
  )
}

SequenceDownload.defaultProps = {
  size: 'small',
}

import * as React from 'react'
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  Collapse,
  Typography,
  Tooltip,
  Chip,
} from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import CloudDownloadIcon from '@mui/icons-material/CloudDownload'
import LockIcon from '@mui/icons-material/Lock'
import { startCase, words, replace, uniqueId } from 'lodash'
import ReactMarkdown from 'react-markdown'

// data resource UIDs TODO: move into conf.
const DR_REFSEQ = 'dr18509'
const DR_GENBANK = 'dr18541'
const DR_BPA = 'dr18544'
const DR_BOLD = 'dr375'

// URLs
const URL_BIE = 'https://bie.ala.org.au/species/'
const URL_NCBI = 'https://www.ncbi.nlm.nih.gov'
const URL_NCBI_GENOME = `${URL_NCBI}/data-hub/genome/`
const URL_NCBI_BIOSAMPLE = `${URL_NCBI}/biosample/`
const URL_NCBI_BIOPROJECT = `${URL_NCBI}/bioproject/`
const URL_NCBI_DOWNLOAD = 'https://api.ncbi.nlm.nih.gov/datasets/v1'
const URL_BPA = 'https://data.bioplatforms.com/dataset/'
const URL_BOLD = 'https://www.boldsystems.org/index.php'
const URL_BOLD_BIN = `${URL_BOLD}/Public_RecordView?processid=`
const URL_BOLD_FASTA = `${URL_BOLD}/API_Public/sequence?ids=`

const fieldsToSkip = [
  'geospatialIssues',
  'speciesListUid',
  'names_and_lsid',
  'assertions',
  'lft',
  'rgt',
  'kingdomID',
  'phylumID',
  'classID',
  'orderID',
  'familyID',
  'genusID',
  'speciesID',
  'common_name_and_lsid',
  'point-0.0001',
  'point-0.001',
  'point-0.01',
  'point-0.02',
  'point-0.1',
  'point-1',
]
const fixedWidthFields = [
  'taxonConceptID',
  'basisOfRecord',
  'catalogNumber',
  'occurrenceStatus',
  'countryCode',
  'decimalLatitude',
  'decimalLongitude',
  'geodeticDatum',
  'dynamicProperties_ncbi_biosample_attributes_json',
  'name_and_lsid',
  'associatedSequences',
  'dynamicProperties_bpa_tags',
  'dynamicProperties_bpa_spatial',
]
const derivedFields = ['sequenceDownload', 'sequenceType']

const fieldsToDecorate = {
  scientificName: {
    prefix: URL_BIE,
    valueField: 'taxonConceptID',
    decoration: 'italic',
  },
  occurrenceID: {
    prefix: true, // dymanic lookup based on DR
    valueField: 'dataResourceUid',
  },
  // sequenceDownload: {
  //   prefix: true, // dymanic lookup based on DR
  //   valueField: 'dataResourceUid',
  // },
  raw_scientificName: { decoration: 'italic' },
  // occurrenceID: { prefix: ncbiUrl },
  dynamicProperties_bpa_id: { prefix: URL_BPA },
  dynamicProperties_ncbi_assembly_accession: {
    prefix: URL_NCBI_GENOME,
  },
  dynamicProperties_ncbi_bioproject: {
    prefix: URL_NCBI_BIOPROJECT,
  },
  dynamicProperties_ncbi_biosample: {
    prefix: URL_NCBI_BIOSAMPLE,
  },
  dynamicProperties_bpa_organization_description: { decoration: 'md' },
  kingdom: { prefix: URL_BIE, valueField: 'kingdomID' },
  phylum: { prefix: URL_BIE, valueField: 'phylumID' },
  class: { prefix: URL_BIE, valueField: 'classID' },
  order: { prefix: URL_BIE, valueField: 'orderID' },
  family: { prefix: URL_BIE, valueField: 'familyID' },
  genus: { prefix: URL_BIE, valueField: 'genusID' },
  species: { prefix: URL_BIE, valueField: 'speciesID', decoration: 'italic' },
}

/**
 * Do a deep search for a key in a nested object (JSON doc)
 *
 * @param {*} obj - nested object
 * @param {*} key - key to find value of (first instance found is returned)
 * @returns value for provided key
 */
function findValueForKey(obj, key) {
  let value = ''
  Object.keys(obj).forEach((k) => {
    if (k === key && Object.keys(obj[k]).length > 0) {
      value = obj[k]
    } else if (!value && typeof obj[k] === 'object') {
      value = findValueForKey(obj[k], key)
    }
  })

  return value
}

function cleanupJsonAndParse(jsonString) {
  const tagsJson = jsonString
    .replace(/\s+None,/g, "'None',") // fix unquoted value in BPA data
    .replace(/'/g, '"') // single to double quotes
    .replace(/\b(True|False)\b/g, (m, v) => v.toLowerCase()) // fix capital case boolean values
  try {
    const tagObj = JSON.parse(tagsJson)
    return tagObj
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('Error parsing JSON:', tagsJson)
  }
  return ''
}

function formatFieldValue(field, data) {
  let value = findValueForKey(data, field) || undefined

  if (
    fieldsToSkip.includes(field) ||
    (!value && !derivedFields.includes(field))
  ) {
    return ''
  }

  if (typeof value === 'object') {
    // Misc properties - output as a formatted JSX elements
    value = replace(JSON.stringify(value, null, 1), /\{\s*|\s*\}|"/g, '')
    value = replace(value, /,*\n\s+/g, '\n')
    value = replace(value, /\]\s*$/g, '')
    const rows = value.split(/(\n)/gi)
    const newRows = []
    for (let i = 1; i < rows.length; i += 1) {
      // skip lines with just a space
      if (rows[i].length > 1) {
        newRows.push(
          <Typography
            component="p"
            key={i}
            sx={{
              fontFamily: 'Roboto Mono',
              fontSize: '14px',
              wordWrap: 'break-all',
              marginTop: 0,
            }}
          >
            {rows[i]}
          </Typography>
        )
      }
    }
    value = <React.Fragment key={field}>{newRows}</React.Fragment>
  } else if (typeof value === 'boolean') {
    // print out boolean values as String (otherwise `false` values will be excluded from output)
    value = value.toString()
  } else if (
    // check for long ISO date strings and shorten to remove time portion
    typeof value === 'string' &&
    value.length > 15 &&
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)((-(\d{2}):(\d{2})|Z)?)$/.test(
      value
    )
  ) {
    // ISO date - show date portion only
    value = value.substring(0, 10)
  } else if (field === 'sequenceDownload') {
    // make it a download link
    if (
      data.dataResourceUid === DR_REFSEQ ||
      data.dataResourceUid === DR_GENBANK
    ) {
      // https://api.ncbi.nlm.nih.gov/datasets/v1/genome/accession/GCA_022045225.1/download?include_annotation_type=GENOME_GFF,RNA_FASTA,CDS_FASTA,PROT_FASTA&filename=GCA_022045225.1.zip
      const urlPathParams = `/genome/accession/${data.occurrenceID}/download?include_annotation_type=GENOME_GFF,RNA_FASTA,CDS_FASTA,PROT_FASTA&filename=${data.occurrenceID}.zip`
      const url = `${URL_NCBI_DOWNLOAD}${urlPathParams}`
      value = (
        <Tooltip title="Download all available sequence files">
          <Chip
            label="ZIP archive"
            color="primary"
            variant="outlined"
            size="small"
            onClick={() => window.open(url, '_partner')}
            onDelete={() => window.open(url, '_partner')}
            deleteIcon={<CloudDownloadIcon />}
          />
        </Tooltip>
      )
    } else if (data.dataResourceUid === DR_BOLD) {
      // http://www.boldsystems.org/index.php/API_Public/sequence?ids=EF581197 fieldNumber
      const id = data.recordNumber || data.materialSampleID || data.fieldNumber
      const url = `${URL_BOLD_FASTA}${id}`
      if (id) {
        value = (
          <Tooltip title="Download sequence files (fasta format)">
            <Chip
              label="FASTA"
              color="primary"
              variant="outlined"
              size="small"
              onClick={() => window.open(url, '_partner')}
              onDelete={() => window.open(url, '_partner')}
              deleteIcon={<CloudDownloadIcon />}
            />
          </Tooltip>
        )
      }
    } else if (data.dataResourceUid === DR_BPA) {
      // is in associatedSequences field
      const sequences = cleanupJsonAndParse(data.associatedSequences) || []
      value = (
        <>
          {sequences.map((seq, i) => (
            <Tooltip
              title={`Download sequence files (${
                seq.format || 'fasta'
              } format)`}
            >
              <Chip
                label={`${i + 1}. ${seq.format || 'FASTA'}`}
                color="primary"
                variant="outlined"
                size="small"
                style={{ marginRight: '.5rem' }}
                onClick={() => window.open(seq.url, '_partner')}
                onDelete={() => window.open(seq.url, '_partner')}
                deleteIcon={<CloudDownloadIcon />}
              />
            </Tooltip>
          ))}
          {data.dynamicProperties_bpa_resource_permissions !== 'public' && (
            <Chip
              icon={<LockIcon />}
              label={
                data.dynamicProperties_bpa_resource_permissions.split(':')[0]
              }
              variant="outlined"
              size="small"
            />
          )}
        </>
      )
      // const tags = []
      // sequences.forEach((seq) => {
      //   const { url } = seq
      //   if (url) {
      //     const snip = (
      //       <Tooltip title="Download sequence files (fasta format)">
      //         <Chip
      //           label="FASTA"
      //           color="primary"
      //           variant="outlined"
      //           size="small"
      //           onClick={() => window.open(url, '_partner')}
      //           onDelete={() => window.open(url, '_partner')}
      //           deleteIcon={<CloudDownloadIcon />}
      //         />
      //       </Tooltip>
      //     )
      //     tags.push(snip)
      //   }
      // })
      // value = tags.join(' ')
    }
  } else if (field === 'sequenceType') {
    if (
      data.dataResourceUid === DR_REFSEQ ||
      data.dataResourceUid === DR_GENBANK
    ) {
      // NCBI
      value = data.dynamicProperties_MIXS_0000005
    } else if (data.dataResourceUid === DR_BOLD) {
      value = 'BOLD Barcode'
    } else if (data.dataResourceUid === DR_BPA) {
      const tagObj = cleanupJsonAndParse(data.dynamicProperties_bpa_tags)
      if (typeof tagObj === 'object') {
        // value = tagObj[0].display_name || tagObj[0].name
        value = tagObj.map((el) => el.display_name || el.name).join(' - ')
      }
    }
  }

  // if (field.endsWith('scientificName') && words(value).length > 1) {
  //   value = <em>{value}</em>
  if (field in fieldsToDecorate) {
    const helper = fieldsToDecorate[field]
    const suffix =
      'valueField' in helper ? data[helper.valueField] || '' : data[field] || ''
    if ('prefix' in helper && helper.prefix !== true) {
      value = (
        <a href={`${helper.prefix}${suffix}`} target="partner">
          {'decoration' in helper &&
          helper.decoration.length > 0 &&
          words(value).length > 1 ? (
            <em>{value}</em>
          ) : (
            <span>{value}</span>
          )}
        </a>
      )
    } else if ('prefix' in helper) {
      // occurrenceID exception
      let urlPrefix = ''
      let urlSuffix = data.occurrenceID
      if (
        data.dataResourceUid === DR_REFSEQ ||
        data.dataResourceUid === DR_GENBANK
      ) {
        urlPrefix = URL_NCBI_GENOME
      } else if (data.dataResourceUid === DR_BPA) {
        urlPrefix = URL_BPA
      } else if (data.dataResourceUid === DR_BOLD) {
        urlPrefix = URL_BOLD_BIN
        urlSuffix =
          data.recordNumber || data.materialSampleID || data.fieldNumber
      }

      if (urlPrefix) {
        value = (
          <Tooltip title="Visit original data source for this sequence">
            <a href={`${urlPrefix}${urlSuffix}`} target="partner">
              {value}
            </a>
          </Tooltip>
        )
      }
    } else if ('decoration' in helper && helper.decoration === 'italic') {
      value = <em>{value}</em>
    } else if ('decoration' in helper && helper.decoration === 'md') {
      // Fix broken MD from BPA where headings are missing whitespace
      const mdVal = replace(value, /(#{1,3})(\S)/g, '$1 $2')
      value = <ReactMarkdown>{mdVal}</ReactMarkdown>
    }
  } else if (value && fixedWidthFields.includes(field)) {
    // Raw JSON field...
    if (field.toLowerCase().includes('json')) {
      value = JSON.stringify(JSON.parse(value), null, 1)
      value = replace(value, /\{\s*|\s*\}|"/g, '')
      value = replace(value, /\n\s+/g, '\n')
      // value = replace(value, /\n/g, '<br/>')
      const lines = value.split(/\n/)
      value = lines.map((line) => (
        <span
          style={{ display: 'inline-block' }}
          key={uniqueId(line.substring(0, 6))}
        >
          {line}
        </span>
      ))
    }

    value = (
      <Typography
        component="p"
        sx={{
          fontFamily: 'Roboto Mono',
          fontSize: '13px',
          wordWrap: 'break-all',
        }}
      >
        {value}
      </Typography>
    )
  }

  return value
}

function mungeFieldName(field) {
  // TODO: Fix this code so its performant and not code-smelly
  const field1 = replace(field, 'dynamicProperties_', '')
  const field2 = replace(field1, 'ncbi_', 'NCBI_')
  const field3 = replace(field2, 'bpa_', 'BPA_')
  return field3
}

export default function RecordSection({ recordData, section, fieldList }) {
  const [open, setOpen] = React.useState(true)
  const listOfFields = section === 'Misc' ? fieldList.sort() : fieldList

  return (
    <React.Fragment key="section">
      <TableRow
        sx={{ backgroundColor: 'rgb(240, 240, 240)' }}
        onClick={() => setOpen(!open)}
      >
        <TableCell style={{ width: '80%', paddingBottom: 4, paddingTop: 4 }}>
          <Typography variant="h6" component="p" style={{ fontSize: '1.1em' }}>
            {section}
          </Typography>
        </TableCell>
        <TableCell
          align="right"
          style={{ width: '10%', paddingBottom: 4, paddingTop: 4 }}
        >
          {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ padding: 0 }} colSpan={2}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Table aria-label="collapsible table" sx={{ tableLayout: 'fixed' }}>
              <TableBody>
                {listOfFields.map(
                  (
                    field // TODO: remove duplicate call to `formatFieldValue()` - extract into separate component
                  ) =>
                    formatFieldValue(field, recordData) && (
                      <TableRow
                        key={uniqueId(field)}
                        sx={{ ':last-child td': { borderBottom: 0 } }}
                      >
                        <TableCell
                          style={{
                            width: '30%',
                            padding: 5,
                            paddingLeft: 16,
                            verticalAlign: 'top',
                            opacity: 0.8,
                          }}
                          colSpan={6}
                        >
                          {startCase(mungeFieldName(field))}
                        </TableCell>
                        <TableCell
                          style={{
                            width: '70%',
                            padding: 5,
                            paddingLeft: 16,
                            verticalAlign: 'top',
                            wordBreak: 'break-all',
                          }}
                          colSpan={6}
                        >
                          {formatFieldValue(field, recordData)}
                        </TableCell>
                      </TableRow>
                    )
                )}
              </TableBody>
            </Table>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  )
}

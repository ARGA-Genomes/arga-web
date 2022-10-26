import * as React from 'react'
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  Collapse,
  Typography,
} from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import { startCase, words, replace, uniqueId } from 'lodash'
import ReactMarkdown from 'react-markdown'

// data resource UIDs
const DR_REFSEQ = 'dr18509'
const DR_GENBANK = 'dr18541'
const DR_BPA = 'dr18544'
// const DR_BOLD = 'dr375'

// URLs
const URL_BIE = 'https://bie.ala.org.au/species/'
const URL_NCBI = 'https://www.ncbi.nlm.nih.gov'
const URL_NCBI_GENOME = `${URL_NCBI}/data-hub/genome/`
const URL_NCBI_BIOSAMPLE = `${URL_NCBI}/biosample/`
const URL_NCBI_BIOPROJECT = `${URL_NCBI}/bioproject/`
const URL_BPA = 'https://data.bioplatforms.com/dataset/'

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

const fieldsToDecorate = {
  scientificName: {
    prefix: URL_BIE,
    valueField: 'taxonConceptID',
    decoration: 'italic',
  },
  occurrenceID: {
    prefix: 'ID', // dymanic lookup based on DR
    valueField: 'dataResourceUid',
  },
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

function getFieldValue(field, data) {
  let value = findValueForKey(data, field) || undefined

  if (fieldsToSkip.includes(field) || !value) {
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
          // <React.Fragment>
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
          // </React.Fragment>
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
  }

  // if (field.endsWith('scientificName') && words(value).length > 1) {
  //   value = <em>{value}</em>
  if (field in fieldsToDecorate) {
    const helper = fieldsToDecorate[field]
    const suffix =
      'valueField' in helper ? data[helper.valueField] || '' : data[field] || ''
    if ('prefix' in helper && helper.prefix !== 'ID') {
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
      if (
        data.dataResourceUid === DR_REFSEQ ||
        data.dataResourceUid === DR_GENBANK
      ) {
        urlPrefix = URL_NCBI_GENOME
      } else if (data.dataResourceUid === DR_BPA) {
        urlPrefix = URL_BPA
      }

      if (urlPrefix) {
        value = (
          <a href={`${urlPrefix}${data.occurrenceID}`} target="partner">
            {value}
          </a>
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
  // Fix this code so its performant and not code-smelly
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
                {listOfFields.map((field) =>
                  getFieldValue(field, recordData) ? (
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
                        {getFieldValue(field, recordData)}
                      </TableCell>
                    </TableRow>
                  ) : (
                    <React.Fragment key={uniqueId(field)} />
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

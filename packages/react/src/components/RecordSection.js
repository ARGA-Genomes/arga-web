import * as React from 'react'
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  Collapse,
  Chip,
  Typography,
  Tooltip,
} from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import { startCase, words, replace, uniqueId } from 'lodash'
import ReactMarkdown from 'react-markdown'
import config from './config'
import cleanupJsonAndParse from '../utils/parseBpaJson'
import SequenceDownload from './SequenceDownload'

const DR_CODES = config.dr_codes

// URLs
const URLS = config.urls

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
const valuesToSkip = ['not applicable', 'none']

const fieldsToDecorate = {
  scientificName: {
    prefix: URLS.BIE,
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
  dynamicProperties_bpa_id: { prefix: URLS.BPA },
  dynamicProperties_ncbi_assembly_accession: {
    prefix: URLS.NCBI_GENOME,
  },
  dynamicProperties_ncbi_bioproject: {
    prefix: URLS.NCBI_BIOPROJECT,
  },
  dynamicProperties_ncbi_biosample: {
    prefix: URLS.NCBI_BIOSAMPLE,
  },
  dynamicProperties_bpa_organization_description: { decoration: 'md' },
  kingdom: { prefix: URLS.BIE, valueField: 'kingdomID' },
  phylum: { prefix: URLS.BIE, valueField: 'phylumID' },
  class: { prefix: URLS.BIE, valueField: 'classID' },
  order: { prefix: URLS.BIE, valueField: 'orderID' },
  family: { prefix: URLS.BIE, valueField: 'familyID' },
  genus: { prefix: URLS.BIE, valueField: 'genusID' },
  species: { prefix: URLS.BIE, valueField: 'speciesID', decoration: 'italic' },
  otherCatalogNumbers: { prefix: URLS.BIOCACHE_CAT_NO, decoration: 'quotes' },
  fire_response: { prefix: URLS.AUS_TRAITS, decoration: 'multivalue' },
  post_fire_recruitment: { prefix: URLS.AUS_TRAITS, decoration: 'multivalue' },
  photosynthetic_pathway: { prefix: URLS.AUS_TRAITS, decoration: 'multivalue' },
}

function checkValueShouldIgnore(value) {
  let isIgnored = false
  const stringValue = Array.isArray(value) ? value[0] : value
  if (valuesToSkip.includes(stringValue.toLowerCase())) {
    isIgnored = true
  }

  return isIgnored
}

/**
 * Do a deep search for a key in a nested object (JSON doc)
 * Recursive!
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

const chipStyle = { padding: '0 4px', marginRight: '.5rem' }

/**
 * Ugly formatting function that marks-up special case
 * fields in the record display section.
 * TODO: extract into nicer code via its own component
 *
 * @param {*} field
 * @param {*} data
 * @returns value - formatted text/JSX value to display
 */
function formatFieldValue(field, data) {
  let value = findValueForKey(data, field) || undefined

  if (
    fieldsToSkip.includes(field) ||
    (!value && !derivedFields.includes(field)) ||
    (value && checkValueShouldIgnore(value))
  ) {
    return '' // normal field needing no special markup
  }

  if (typeof value === 'object' && !(field in fieldsToDecorate)) {
    // Misc properties - output as a fixed-width font formatted JSX elements
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
    // show download buttons/links
    value = <SequenceDownload data={data} size="small" />
  } else if (field === 'sequenceType') {
    if (
      data.dataResourceUid === DR_CODES.DR_REFSEQ ||
      data.dataResourceUid === DR_CODES.DR_GENBANK
    ) {
      // NCBI
      // value = data.dynamicProperties_MIXS_0000005
      value = (
        <Chip
          label={data.dynamicProperties_MIXS_0000005}
          variant="outlined"
          size="small"
          style={chipStyle}
        />
      )
    } else if (data.dataResourceUid === DR_CODES.DR_BOLD) {
      // value = 'BOLD Barcode'
      value = (
        <Chip
          label="BOLD Barcode"
          variant="outlined"
          size="small"
          style={chipStyle}
        />
      )
    } else if (data.dataResourceUid === DR_CODES.DR_BPA) {
      const tagObj = cleanupJsonAndParse(data.dynamicProperties_bpa_tags)
      if (typeof tagObj === 'object') {
        // value = tagObj.map((el) => el.display_name || el.name).join(' - ')
        value = tagObj.map((el) => (
          <Chip
            key={el.name}
            id={el.display_name || el.name}
            label={el.display_name || el.name}
            // color="primary"
            variant="outlined"
            size="small"
            style={chipStyle}
          />
        ))
      }
    }
  }

  // second pass in case we need to have some common formatting for multiple
  // cases from above...
  // data-driven via Object lookup `fieldsToDecorate` (clunky)

  // if (field.endsWith('scientificName') && words(value).length > 1) {
  //   value = <em>{value}</em>
  if (field in fieldsToDecorate) {
    const helper = fieldsToDecorate[field]
    let suffix =
      'valueField' in helper ? data[helper.valueField] || '' : data[field] || ''
    if (
      'prefix' in helper &&
      'decoration' in helper &&
      helper.decoration === 'multivalue'
    ) {
      // `decoration: 'multivalue'` fields that need links added (via `prefix`)
      const values = typeof value === 'object' ? value : [value]
      value = values.map((val) => (
        <Tooltip
          title="Visit original data source"
          style={{ paddingRight: 10, display: 'block' }}
        >
          <a href={`${helper.prefix}${field}`} target="partner">
            {val}
          </a>
        </Tooltip>
      ))
    } else if ('prefix' in helper && helper.prefix !== true) {
      let wrappedValue = <span>{value}</span>

      if (
        'decoration' in helper &&
        helper.decoration === 'italic' &&
        words(value).length > 1
      ) {
        wrappedValue = <em>{value}</em>
      } else if ('decoration' in helper && helper.decoration === 'quotes') {
        // most likely `otherCatalogNumbers` field
        const val = typeof value === 'object' ? value[0] : value
        const query =
          typeof val === 'string'
            ? val.replace(/(^A-Za-z0-9)+\.(\d+)/, '$1')
            : val
        suffix = `catalogNumber:${query}*`
      }
      // console.log('decoration', wrappedValue)
      value = (
        <a href={`${helper.prefix}${suffix}`} target="partner">
          {wrappedValue}
        </a>
      )
    } else if ('prefix' in helper) {
      // occurrenceID exception
      let urlPrefix = ''
      let urlSuffix = data.occurrenceID
      if (
        data.dataResourceUid === DR_CODES.DR_REFSEQ ||
        data.dataResourceUid === DR_CODES.DR_GENBANK
      ) {
        urlPrefix = URLS.NCBI_GENOME
      } else if (data.dataResourceUid === DR_CODES.DR_BPA) {
        urlPrefix = URLS.BPA
      } else if (data.dataResourceUid === DR_CODES.DR_BOLD) {
        urlPrefix = URLS.BOLD_BIN
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

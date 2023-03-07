import { startCase, replace, upperFirst, lowerCase } from 'lodash'

const labelReplaceRegex = {
  dynamicProperties_ncbi_: '',
  dynamicProperties_bpa_: '',
  dynamicProperties_ncbi_genome_rep: 'NCBI genome representation',
  dynamicProperties_ncbi_assembly_level: 'NCBI assembly level',
  dynamicProperties_MIXS_0000005: 'Genome assembly level',
  dynamicProperties_bpa_resource_permissions: 'BPA access permissions',
  dataResourceName: 'data source',
  countryConservation: 'EPBC Conservation status',
  stateConservation: 'State Conservation status',
  matchType: 'Taxon match type',
  speciesListUid: 'conservation status',
}

// Enum for formatter types
const FormatterType = {
  UpperFirst: 1,
  Upper: 2,
  StartCase: 3,
  BPA: 4,
}

// Map fields to FormatterType
const specialFormatters = {
  matchType: FormatterType.UpperFirst,
  speciesGroup: FormatterType.StartCase,
  fire_response: FormatterType.UpperFirst,
  post_fire_recruitment: FormatterType.UpperFirst,
  photosynthetic_pathway: FormatterType.Upper,
  dynamicProperties_bpa_resource_permissions: FormatterType.BPA,
  presentInCountry: FormatterType.UpperFirst,
}

/**
 * Format the display of facet values in drop-downs, et al.
 *
 * @param {*} field
 * @param {*} value
 * @returns
 */
export function formatFacetValue(field, value) {
  let label = value

  if (specialFormatters[field]) {
    switch (specialFormatters[field]) {
      case FormatterType.Upper:
        label = value.toUpperCase()
        break
      case FormatterType.UpperFirst:
        label = upperFirst(lowerCase(value))
        break
      case FormatterType.StartCase:
        label = startCase(lowerCase(value))
        break
      case FormatterType.BPA:
        label = value.replaceAll('_', ' ')
        label = label.replaceAll(':', ' ')
        label = upperFirst(label)
        break
      default:
    }
  }

  return label
}

/**
 * Create a human readable label from a SOLR field name
 *
 * @param {String} label SOLR field name
 * @returns formatted label
 */
export function formatLabels(label) {
  const replacements = Object.keys(labelReplaceRegex)
    .map((searchString) => {
      const re = new RegExp(searchString, 'g')
      const newLabel = replace(label, re, labelReplaceRegex[searchString])
      return newLabel !== label ? newLabel : null
    })
    .filter((a) => a)
  // Note that there can be multiple substitutions that match, so place the
  // "best" match after an earlier one, for it to "win" (via `array.slice(-1)[0]`)
  const returnString =
    replacements.length > 0 ? replacements.slice(-1)[0] : label
  return startCase(returnString)
}

/**
 * Format label for `Chip` by checking for `label` attribute and falling
 * back to `name` attribute with `startCase` formatting
 *
 * @param {*} name
 * @param {*} valueList
 * @returns
 */
export function getLabelForName(field, name, valueList) {
  const item = valueList.find((val) => val.name === name)
  // return item && item.label ? item.label : startCase(name)
  const value = item && item.label ? item.label : name
  return formatFacetValue(field, value)
}

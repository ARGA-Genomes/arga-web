import { getLabelForName } from '../components/FacetSelect'
import { formatLabels, formatFacetValue } from '../utils/formatLabel'

test('formatLabels returns expected value', () => {
  expect(formatLabels('dynamicProperties_MIXS_0000005')).toEqual(
    'Genome Assembly Level'
  )
})

test('formatLabels returns expected value', () => {
  expect(formatLabels('dynamicProperties_ncbi_foo_bar')).toEqual('Foo Bar')
})

test('formatLabels returns expected value', () => {
  expect(formatLabels('dynamicProperties_bpa_resource_permissions')).toEqual(
    'BPA Access Permissions'
  )
})

test('formatLabels returns expected value', () => {
  expect(formatLabels('scientificName')).toEqual('Scientific Name')
})

test('formatLabels returns expected value', () => {
  expect(formatLabels('dynamicProperties_bpa_num_tags')).toEqual('Num Tags')
})

const vl1 = [
  { name: 'Vulnerable', count: 1017 },
  { name: 'Endangered', count: 540 },
  { name: 'Critically Endangered', count: 330 },
]

test('getLabelForName returns expected value', () => {
  expect(getLabelForName('Endagered', vl1)).toEqual('Endagered')
})

const vl2 = [
  { name: 'organization_member', count: 10525 },
  { name: 'public', count: 43 },
]

test('getLabelForName returns expected value', () => {
  expect(getLabelForName('organization_member', vl2)).toEqual(
    'Organization Member'
  )
})

test('formatFacetValue returns expected value 1', () => {
  expect(formatFacetValue('presentInCountry', 'AUSTRALIA')).toEqual('Australia')
})

test('formatFacetValue returns expected value 2', () => {
  expect(formatFacetValue('matchType', 'phrase_match')).toEqual('Phrase match')
})

test('formatFacetValue returns expected value 3', () => {
  expect(formatFacetValue('speciesGroup', 'FernsAndAllies')).toEqual(
    'Ferns And Allies'
  )
})

test('formatFacetValue returns expected value 4', () => {
  expect(formatFacetValue('fire_response', 'fire_killed')).toEqual(
    'Fire killed'
  )
})

test('formatFacetValue returns expected value 5', () => {
  expect(formatFacetValue('dataResourceName', 'NCBI Genome Genbank')).toEqual(
    'NCBI Genome Genbank'
  )
})

test('formatFacetValue returns expected value 6', () => {
  expect(
    formatFacetValue(
      'dynamicProperties_bpa_resource_permissions',
      'organization_member_after_embargo:date_of_transfer_to_archive:90:am-consortium-members'
    )
  ).toEqual(
    'Organization member after embargo date of transfer to archive 90 am-consortium-members'
  )
})

test('formatFacetValue returns expected value 6', () => {
  expect(formatFacetValue('photosynthetic_pathway', 'c3-cam')).toEqual('C3-CAM')
})

import { formatLabels, getLabelForName } from '../components/FacetSelect'

test('formatLabels returns expected value', () => {
  expect(formatLabels('dynamicProperties_ncbi_assembly_level')).toEqual(
    'NCBI Assembly Level'
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

import { pruneSequenceObject } from '../components/Basket'
import record1 from './record1.json'

test('pruneSequenceObject returns expected value', () => {
  const savedRecord = {
    'Scientific Name': 'Mitrella tiwiensis',
    Dataset: 'BPA Genomic Sequence Data',
    Accession: 'bpa-gap-illumina-shortread-83376-83658',
    'Common Name': 'A Vine',
    Date: '2021-02-16T13:00:00Z',
    'Sequence count': 1970,
  }
  expect(pruneSequenceObject(record1)).toEqual(savedRecord)
})

test('pruneSequenceObject returns expected incorrect input message', () => {
  const record2 = {
    id: 'abc123',
    quantity: 1,
  }
  expect(pruneSequenceObject(record2)).toContain('Error: no data')
})

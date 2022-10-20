// import { TableRow } from '@mui/material'
import { pruneSequenceObject } from '../components/Basket'
import record1 from './record1.json'

const savedRecord = {
  'Scientific Name': 'Mitrella tiwiensis',
  Dataset: 'BPA Genomic Sequence Data',
  Accession: 'bpa-gap-illumina-shortread-83376-83658',
  'Common Name': 'A Vine',
  Date: '2021-02-16T13:00:00Z',
  'Sequence count': 1970,
}

const record2 = {
  id: 'abc123',
  quantity: 1,
}

// unit tests for pure functions
test('pruneSequenceObject returns expected value', () => {
  expect(pruneSequenceObject(record1)).toEqual(savedRecord)
})

test('pruneSequenceObject returns expected incorrect input message', () => {
  expect(pruneSequenceObject(record2)).toContain('Error: no data')
})

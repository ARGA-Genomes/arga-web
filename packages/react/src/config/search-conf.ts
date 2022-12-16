interface DataColumn {
  field: string,
  headerName: String,
  type?: string,
  width: number,
  sortable?: boolean,
  hide?: boolean,
  renderCell?: any,
  valueGetter?: any,
}

export const columnDefinitions : DataColumn[] = [
  {
    field: 'id',
    headerName: 'ID',
    width: 100,
    sortable: false,
    hide: true,
  },
  {
    field: 'score',
    headerName: 'Score',
    width: 100,
    sortable: true,
    hide: true,
  },
  {
    field: 'occurrenceID',
    headerName: 'Accession',
    width: 145,
  },
]
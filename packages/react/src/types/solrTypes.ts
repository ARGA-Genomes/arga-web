export interface SolrParams {
  q: string,
  fq?: string[],
  sortDirection?: string,
  sortField?: string,
  page?: number,
  pageSize?: number,
}
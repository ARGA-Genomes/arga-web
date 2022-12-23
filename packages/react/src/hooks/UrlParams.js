// import { useSearchParams } from 'react-router-dom'
// import { URLSearchParams } from 'url'
import {
  useQueryParams,
  StringParam,
  NumberParam,
  ArrayParam,
  withDefault,
} from 'use-query-params'
// import config from '../components/config'
// import { SolrParams } from '../types/solrTypes'

const FqParam = withDefault(ArrayParam, []) // support mutliple `fq` values in URL - `?fq=foo:one&fq:bar:two`

export default function useUrlParams() {
  const [solrParams, setSolrParams] = useQueryParams({
    q: StringParam,
    filters: FqParam,
    sortDirection: StringParam,
    sortField: StringParam,
    page: NumberParam,
    pageSize: NumberParam,
  })

  // const [searchParams, setSearchParams] = useSearchParams()
  // const solrParams = { ...config.solrParams }
  // const defaultSolrParams = config.solrParams

  // Object.keys(config.solrParams).forEach((field) => {
  //   // check if any of the solrParams are contained in the URL search params object
  //   // and assign to `solrParams` if present.
  //   if (searchParams.get(field)) {
  //     solrParams[field] = searchParams.get(field)
  //   }
  // })

  // // might need to be wrapped in useCallback() ??
  // const setSolrParams = (params) => {
  //   // const paramsCopy: URLSearchParamsInit = { ...params }
  //   console.log('setSolrParams params:', params)
  //   setSearchParams((old) => ({
  //     q: params.q || old.q || defaultSolrParams.q,
  //     fq: params.fq || old.fq || defaultSolrParams.fq,
  //     sortField:
  //       params.sortField || old.sortField || defaultSolrParams.sortField,
  //     sortDirecion:
  //       params.sortDirection ||
  //       old.sortDirection ||
  //       defaultSolrParams.sortDirection,
  //     page: params.page?.toString() || old.page || defaultSolrParams.page,
  //     pageSize:
  //       params.pageSize?.toString() ||
  //       old.pageSize ||
  //       defaultSolrParams.pageSize,
  //   }))
  // }

  return [solrParams, setSolrParams]
}

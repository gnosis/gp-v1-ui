import { useMemo, useState } from 'react'
import { useDebounce } from './useDebounce'

type FilterFnFactory<T> = (searchTxt: string) => (params: T, index: number, array: T[]) => boolean | null

interface InternalState<T> {
  debouncedSearch?: string
  showFilter?: boolean
  data?: T[]
}

interface HookResults<T> {
  filteredData: T[]
  search: string
  showFilter: boolean
  handlers: {
    handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void
    handleToggleFilter: (e: React.ChangeEvent<HTMLInputElement>) => void
    clearFilters: () => void
  }
}

export interface HookParams<T> {
  data: T[]
  searchDebounceTime?: number
  isSearchFilter?: boolean
  userConditionalCheck?: (internalState?: InternalState<T>) => boolean
  filterFnFactory: FilterFnFactory<T>
}

function useDataFilter<T>({
  data,
  isSearchFilter = true,
  searchDebounceTime = 500,
  filterFnFactory,
  userConditionalCheck,
}: HookParams<T>): HookResults<T> {
  const [search, setSearch] = useState('')
  // searchFilter prop turns on/off by default. If using search filter, we dont want to use toggle
  const [showFilter, setShowFilter] = useState(isSearchFilter)
  const { value: debouncedSearch, setImmediate: setDebouncedSearch } = useDebounce(search, searchDebounceTime)

  const handlers = useMemo(() => {
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>): void => setSearch(e.target.value)
    const handleToggleFilter = (): void => setShowFilter((state) => !state)
    const clearFilters = (): void => {
      setSearch('')
      setDebouncedSearch('')
      setShowFilter(isSearchFilter)
    }

    return {
      handleSearch,
      handleToggleFilter,
      clearFilters,
    }
  }, [setDebouncedSearch, isSearchFilter])

  const filteredData = useMemo(() => {
    const failsBasicSearchReq = !showFilter || (isSearchFilter && !debouncedSearch) || !data || data.length === 0
    // pass internal state to user's userConditionalCheck fn for use outside
    const failsUserReq = userConditionalCheck && userConditionalCheck({ debouncedSearch, data, showFilter })

    if (failsBasicSearchReq || failsUserReq) return data

    const searchTxt = debouncedSearch.trim().toLowerCase()
    const customFilterFn = filterFnFactory(searchTxt)

    // check null return from customFilterFn to opt out
    if (!customFilterFn) return data

    return data.filter(customFilterFn)
  }, [debouncedSearch, data, isSearchFilter, showFilter, userConditionalCheck, filterFnFactory])

  return {
    filteredData,
    search,
    showFilter,
    handlers,
  }
}

export default useDataFilter

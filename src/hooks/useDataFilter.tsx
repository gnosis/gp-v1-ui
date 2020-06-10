import { useMemo, useState } from 'react'
import { useDebounce } from './useDebounce'

interface HookResults<T> {
  filteredData: T[]
  search: string
  showFilter: boolean
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleToggleFilter: (e: React.ChangeEvent<HTMLInputElement>) => void
  clearFilters: () => void
}

export interface HookParams<T> {
  data: T[]
  searchDebounceTime?: number
  isSearchFilter?: boolean
  customStopCheck?: (...any: unknown[]) => boolean
  filterFnFactory: (searchTxt: string) => (params: T, index: number, array: T[]) => boolean
}

function useDataFilter<T>({
  data,
  searchDebounceTime = 500,
  isSearchFilter = true,
  customStopCheck,
  filterFnFactory,
}: HookParams<T>): HookResults<T> {
  const [search, setSearch] = useState('')
  // searchFilter prop turns on/off by default. If using search filter, we dont want to use toggle
  const [showFilter, setShowFilter] = useState(isSearchFilter)
  const { value: debouncedSearch, setImmediate: setDebouncedSearch } = useDebounce(search, searchDebounceTime)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>): void => setSearch(e.target.value)
  const handleToggleFilter = (e: React.ChangeEvent<HTMLInputElement>): void =>
    setShowFilter(state => e?.target?.checked || !state)
  const clearFilters = (): void => {
    setSearch('')
    setDebouncedSearch('')
    setShowFilter(false)
  }

  const filteredData = useMemo(() => {
    // showFilter: if we want to hide zero balances for example
    // debouncedSearch or custom conditional check is used here
    // no data
    if (!showFilter || (!debouncedSearch && customStopCheck && customStopCheck()) || !data || data.length === 0)
      return data

    const searchTxt = debouncedSearch.trim().toLowerCase()

    const customFilterFn = filterFnFactory(searchTxt)

    return data.filter(customFilterFn)
  }, [debouncedSearch, data, showFilter, customStopCheck, filterFnFactory])

  return {
    filteredData,
    search,
    showFilter,
    handleSearch,
    handleToggleFilter,
    clearFilters,
  }
}

export default useDataFilter

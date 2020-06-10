import { useMemo, useState } from 'react'
import { useDebounce } from './useDebounce'

interface HookResults<T> {
  filteredData: T[]
  search: string
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void
  clearFilters: () => void
}

export interface HookParams<T> {
  data: T[]
  searchDebounceTime?: number
  customStopCheck?: (...any: unknown[]) => boolean
  filterFnFactory: (searchTxt: string) => (params: T, index: number, array: T[]) => boolean
}

function useSearchFilter<T>({
  data,
  searchDebounceTime = 500,
  customStopCheck,
  filterFnFactory,
}: HookParams<T>): HookResults<T> {
  const [search, setSearch] = useState('')
  const { value: debouncedSearch, setImmediate: setDebouncedSearch } = useDebounce(search, searchDebounceTime)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>): void => setSearch(e.target.value)
  const clearFilters = (): void => {
    setSearch('')
    setDebouncedSearch('')
  }

  const filteredData = useMemo(() => {
    if ((!debouncedSearch && customStopCheck && customStopCheck()) || !data || data.length === 0) return data

    const searchTxt = debouncedSearch.trim().toLowerCase()

    const customFilterFn = filterFnFactory(searchTxt)

    return data.filter(customFilterFn)
  }, [debouncedSearch, data, customStopCheck, filterFnFactory])

  return {
    filteredData,
    search,
    handleSearch,
    clearFilters,
  }
}

export default useSearchFilter

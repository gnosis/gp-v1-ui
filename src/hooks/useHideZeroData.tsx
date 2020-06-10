import { useMemo, useState } from 'react'
import { HookParams as SearchFilterParams } from './useDataFilter'

interface Results<T> {
  filteredData: T[]
  hideZeroData: boolean
  handleHideZeroData: (e: React.ChangeEvent<HTMLInputElement>) => void
  clearFilters: () => void
}

interface HookParams<T> extends Pick<SearchFilterParams<T>, 'data' | 'customStopCheck'> {
  filterFn: (params: T, index: number, array: T[]) => boolean
}

function useHideZeroData<T>({ data, customStopCheck, filterFn }: HookParams<T>): Results<T> {
  const [hideZeroData, setHideZeroData] = useState(false)

  const handleHideZeroData = (e: React.ChangeEvent<HTMLInputElement>): void => setHideZeroData(e.target.checked)
  const clearFilters = (): void => setHideZeroData(false)

  const filteredData = useMemo(() => {
    if (!hideZeroData || !data || data.length === 0 || (customStopCheck && customStopCheck())) return data

    return data.filter(filterFn)
  }, [hideZeroData, data, customStopCheck, filterFn])

  return {
    filteredData,
    hideZeroData,
    handleHideZeroData,
    clearFilters,
  }
}

export default useHideZeroData

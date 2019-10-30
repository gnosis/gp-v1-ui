import { useState, useMemo } from 'react'

function setURLFilterParams(filterString: string, moveNow?: boolean): string | void | boolean {
  if (!window || !window.history) return false
  const defaultLocation = window.location.href.split('?')[0]
  if (!filterString) return null
  return moveNow
    ? (window.location.href = `${defaultLocation}${filterString}`)
    : window.history.replaceState(null, null, `?${filterString}`)
}

export function useLocation(): URLSearchParams {
  const [search, setSearch] = useState(location.search)

  useMemo(() => {
    setSearch(search)
  }, [search])

  return new URLSearchParams(search)
}

export default function useURLParams(newParams: string): void {
  useMemo(() => {
    setURLFilterParams(newParams)
  }, [newParams])
}

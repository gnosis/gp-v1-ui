import { useLocation } from 'react-router'
import { useMemo } from 'react'

/**
 * Prevents invalid numbers from being inserted by hand in the URL
 *
 * @param value Input from URL
 */
function sanitizeInput(value?: string | null): string {
  return value && Number(value) ? value : '0'
}

export function useQuery(): { sellAmount: string; buyAmount: string } {
  const query = new URLSearchParams(useLocation().search)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const sellAmount = useMemo(() => sanitizeInput(query.get('sell')), [])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const buyAmount = useMemo(() => sanitizeInput(query.get('buy')), [])

  return {
    sellAmount,
    buyAmount,
  }
}

/**
 * Syntactic sugar to build search queries
 *
 * @param params object with key:value strings for the search query
 */
export function buildSearchQuery(params: { [key in string]: string }): URLSearchParams {
  return new URLSearchParams(params)
}

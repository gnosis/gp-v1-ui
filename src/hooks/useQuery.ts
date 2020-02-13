import { useLocation } from 'react-router'
import { useMemo } from 'react'
import { multOfFive } from 'utils'

/**
 * Prevents invalid numbers from being inserted by hand in the URL
 *
 * @param value Input from URL
 */
function sanitizeInput(value?: string | null, defaultValue = '0'): string {
  return value && Number(value) ? value : defaultValue
}

/**
 * Prevents invalid NEGATIVE numbers from being inserted by hand in the URL
 *
 * @param value Input from URL
 */
function sanitizeNegativeInput(value?: string | null, defaultValue = '0'): string {
  return (Number(value) === 0 || Number(value) >= 5) && value ? multOfFive(value).toString() : defaultValue
}

export function useQuery(): { sellAmount: string; buyAmount: string; validUntil?: string } {
  const { search } = useLocation()

  return useMemo(() => {
    const query = new URLSearchParams(search)

    return {
      sellAmount: sanitizeInput(query.get('sell')),
      buyAmount: sanitizeInput(query.get('buy')),
      validUntil: sanitizeNegativeInput(query.get('expires'), '30'),
    }
  }, [search])
}

/**
 * Syntactic sugar to build search queries
 *
 * @param params object with key:value strings for the search query
 */
export function buildSearchQuery(params: { [key in string]: string }): URLSearchParams {
  return new URLSearchParams(params)
}

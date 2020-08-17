import { useLocation } from 'react-router'
import { useMemo } from 'react'
import { sanitizeInput, checkDateOrValidBatchTime } from 'utils'

export function useQuery(): {
  sellAmount: string
  price: string
  validFrom: string | null
  validUntil: string | null
} {
  const { search } = useLocation()

  return useMemo(() => {
    const query = new URLSearchParams(search)

    return {
      sellAmount: sanitizeInput(query.get('sell')),
      price: sanitizeInput(query.get('price')),
      validFrom: checkDateOrValidBatchTime(query.get('from')),
      validUntil: checkDateOrValidBatchTime(query.get('expires')),
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

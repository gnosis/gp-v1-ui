import { useLocation } from 'react-router'
import { useMemo } from 'react'
import { sanitizeInput, sanitizeNegativeAndMakeMultipleOf } from 'utils'
import { DEFAULT_FORM_STATE } from 'components/TradeWidget'

export function useQuery(): { sellAmount: string; price: string; validFrom?: string; validUntil?: string } {
  const { search } = useLocation()

  return useMemo(() => {
    const query = new URLSearchParams(search)

    return {
      sellAmount: sanitizeInput(query.get('sell')),
      price: sanitizeInput(query.get('price')),
      validFrom: sanitizeNegativeAndMakeMultipleOf(query.get('from'), DEFAULT_FORM_STATE.validFrom),
      validUntil: sanitizeNegativeAndMakeMultipleOf(query.get('expires'), DEFAULT_FORM_STATE.validUntil),
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

import { useEffect } from 'react'

import useSafeState from './useSafeState'
import { TokenDetails } from 'types'

interface HookReturn {
  baseToken: TokenDetails
  quoteToken: TokenDetails
}

interface HookProps {
  sellToken: TokenDetails
  receiveToken: TokenDetails
}

export default ({ sellToken, receiveToken }: HookProps): HookReturn => {
  // baseToken = receiveToken
  // quoteToken = sellToken
  // baseToken/quoteToken
  const [baseToken, setBaseToken] = useSafeState(receiveToken)
  const [quoteToken, setQuoteToken] = useSafeState(sellToken)

  useEffect(() => {
    // use defaults if no tokens or both are volatile (non-priority) tokens
    if (!sellToken || !receiveToken || (!sellToken.priority && !receiveToken.priority)) return

    let base = receiveToken
    let quote = sellToken

    const buyIsWeth = base.priority === 3
    const sellIsWeth = quote.priority === 3
    const sellIsStable = quote.priority === 1 || quote.priority === 2
    const buyIsVolatile = !base.priority

    // Volatile/stable -> Always stable as quote
    // volatile/WETH -> WETH as quote token
    if ((sellIsStable || sellIsWeth) && (buyIsVolatile || buyIsWeth)) {
      base = sellToken
      quote = receiveToken
    }
    // stable/stable -> As user inputs, respecting base/quote system
    // volatile/volatile -> As user inputs
    setBaseToken(base)
    setQuoteToken(quote)
  }, [baseToken, receiveToken, sellToken, setBaseToken, setQuoteToken])

  return {
    baseToken,
    quoteToken,
  }
}

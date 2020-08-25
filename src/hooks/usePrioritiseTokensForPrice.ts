import { useEffect } from 'react'

import useSafeState from './useSafeState'
import { TokenDetails } from 'types'

interface HookReturn {
  baseToken: TokenDetails
  quoteToken: TokenDetails
}

interface HookProps {
  sellToken: TokenDetails
  buyToken: TokenDetails
}

export default ({ sellToken, buyToken }: HookProps): HookReturn => {
  // baseToken = buyToken
  // quoteToken = sellToken
  // baseToken/quoteToken
  const [baseToken, setBaseToken] = useSafeState(buyToken)
  const [quoteToken, setQuoteToken] = useSafeState(sellToken)

  useEffect(() => {
    // use defaults if no tokens or both are volatile (non-priority) tokens
    if (!sellToken || !buyToken || (!sellToken.priority && !buyToken.priority)) return

    let base = buyToken
    let quote = sellToken

    const sellIsStable = quote.priority === 1 || quote.priority === 2
    const buyIsVolatile = !base.priority
    const buyIsWeth = base.priority === 3
    const sellIsWeth = quote.priority === 3

    // Volatile/stable -> Always stable as quote
    // volatile/WETH -> WETH as quote token
    if ((sellIsStable || sellIsWeth) && (buyIsVolatile || buyIsWeth)) {
      base = sellToken
      quote = buyToken
    }
    // stable/stable -> As user inputs, respecting base/quote system
    // volatile/volatile -> As user inputs
    setBaseToken(base)
    setQuoteToken(quote)
  }, [baseToken, buyToken, sellToken, setBaseToken, setQuoteToken])

  return {
    baseToken,
    quoteToken,
  }
}

import { useEffect } from 'react'

import useSafeState from './useSafeState'
import { TokenDetails } from 'types'

interface HookReturn {
  baseToken: TokenDetails
  quoteToken: TokenDetails
  wasInverted: boolean
}

interface HookProps {
  sellToken: TokenDetails
  receiveToken: TokenDetails
}

interface SmartTokenStruct {
  baseToken: TokenDetails
  quoteToken: TokenDetails
  wasInverted: boolean
}

export function checkMarketAndSmartAdjust({ sellToken, receiveToken }: HookProps): SmartTokenStruct {
  let baseToken = receiveToken
  let quoteToken = sellToken
  let wasInverted = false

  // Prio: 1    - STABLE USD
  // Prio: 2    - STABLE EUR
  // Prio: 3    - WETH
  // Prio: 99   - VOLATILE
  const basePrio = baseToken.priority || 99
  const quotePrio = quoteToken.priority || 99

  // Receive token has priority = make price point
  if (basePrio < quotePrio) {
    baseToken = sellToken
    quoteToken = receiveToken
    wasInverted = true
  }

  return {
    baseToken,
    quoteToken,
    wasInverted,
  }
}

export default ({ sellToken, receiveToken }: HookProps): HookReturn => {
  // baseToken = receiveToken
  // quoteToken = sellToken
  // baseToken/quoteToken
  const [baseToken, setBaseToken] = useSafeState(receiveToken)
  const [quoteToken, setQuoteToken] = useSafeState(sellToken)
  const [wasInverted, setWasInverted] = useSafeState(false)

  useEffect(() => {
    const { baseToken, quoteToken, wasInverted } = checkMarketAndSmartAdjust({ sellToken, receiveToken })

    setBaseToken(baseToken)
    setQuoteToken(quoteToken)
    setWasInverted(wasInverted)
  }, [baseToken, quoteToken, receiveToken, sellToken, setBaseToken, setQuoteToken, setWasInverted])

  return {
    baseToken,
    quoteToken,
    wasInverted,
  }
}

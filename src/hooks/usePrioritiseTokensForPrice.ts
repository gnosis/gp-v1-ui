import { useEffect } from 'react'

import useSafeState from './useSafeState'
import { TokenDetails } from 'types'

interface HookProps {
  sellToken: TokenDetails
  receiveToken: TokenDetails
}

interface SmartTokenStruct {
  baseToken: TokenDetails
  quoteToken: TokenDetails
  wasPriorityAdjusted: boolean
}

export function checkMarketAndSmartAdjust({ sellToken, receiveToken }: HookProps): SmartTokenStruct {
  let baseToken = receiveToken
  let quoteToken = sellToken
  let wasPriorityAdjusted = false

  // Prio: 1                  - STABLE USD
  // Prio: 2                  - STABLE EUR
  // Prio: 3                  - WETH
  // Prio: MAX_SAFE_INTEGER   - VOLATILE
  const basePrio = baseToken.priority || Number.MAX_SAFE_INTEGER
  const quotePrio = quoteToken.priority || Number.MAX_SAFE_INTEGER

  // Receive token has priority = make price point
  if (basePrio < quotePrio) {
    baseToken = sellToken
    quoteToken = receiveToken
    wasPriorityAdjusted = true
  }

  return {
    baseToken,
    quoteToken,
    wasPriorityAdjusted,
  }
}

export default ({ sellToken, receiveToken }: HookProps): SmartTokenStruct => {
  // baseToken = receiveToken
  // quoteToken = sellToken
  // baseToken/quoteToken
  const [baseToken, setBaseToken] = useSafeState(receiveToken)
  const [quoteToken, setQuoteToken] = useSafeState(sellToken)
  const [wasPriorityAdjusted, setWasInverted] = useSafeState(false)

  useEffect(() => {
    const { baseToken, quoteToken, wasPriorityAdjusted } = checkMarketAndSmartAdjust({ sellToken, receiveToken })

    setBaseToken(baseToken)
    setQuoteToken(quoteToken)
    setWasInverted(wasPriorityAdjusted)
  }, [baseToken, quoteToken, receiveToken, sellToken, setBaseToken, setQuoteToken, setWasInverted])

  return {
    baseToken,
    quoteToken,
    wasPriorityAdjusted,
  }
}

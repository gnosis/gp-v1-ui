import { useEffect } from 'react'

import useSafeState from './useSafeState'
import { TokenDetails } from 'types'

interface HookReturn {
  baseToken: TokenDetails
  quoteToken: TokenDetails
  wasPriorityAdjusted: boolean
}

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
    wasPriorityAdjusted = true
  }

  return {
    baseToken,
    quoteToken,
    wasPriorityAdjusted,
  }
}

export default ({ sellToken, receiveToken }: HookProps): HookReturn => {
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

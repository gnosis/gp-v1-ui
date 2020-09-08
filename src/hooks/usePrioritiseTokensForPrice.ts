import { useMemo } from 'react'

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

  return useMemo(() => {
    return checkMarketAndSmartAdjust({ sellToken, receiveToken })
  }, [receiveToken, sellToken])
}

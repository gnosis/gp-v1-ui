import { useMemo } from 'react'
import { TokenDetails } from 'types'

interface HookProps {
  sellToken: TokenDetails
  receiveToken: TokenDetails
  startInverse: boolean
}

export default ({ sellToken, receiveToken, startInverse }: HookProps): boolean => {
  // baseToken = receiveToken
  // quoteToken = sellToken
  // baseToken/quoteToken
  const showInverse = useMemo(() => {
    // use defaults if no tokens or both are volatile (non-priority) tokens
    if (!sellToken || !receiveToken || (!sellToken.priority && !receiveToken.priority)) return false

    let showInversePrice = startInverse

    const receiveIsWeth = receiveToken.priority === 3
    const sellIsWeth = sellToken.priority === 3
    const sellIsStable = sellToken.priority === 1 || sellToken.priority === 2
    const receiveIsVolatile = !receiveToken.priority

    // IF: [WETH]/[STABLE] OR [VOLATILE]/[STABLE] OR [VOLATILE]/[WETH]
    if ((sellIsStable || sellIsWeth) && (receiveIsVolatile || receiveIsWeth)) {
      showInversePrice = true
    } else {
      showInversePrice = false
    }

    return showInversePrice
  }, [receiveToken, sellToken, startInverse])

  return showInverse
}

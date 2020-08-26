import { useMemo } from 'react'
import { TokenDetails } from 'types'

interface HookProps {
  sellToken: TokenDetails
  receiveToken: TokenDetails
  isInverse: boolean
}

export default ({ sellToken, receiveToken, isInverse }: HookProps): boolean => {
  // baseToken = receiveToken
  // quoteToken = sellToken
  // baseToken/quoteToken
  const showInverse = useMemo(() => {
    const receiveIsWeth = receiveToken.priority === 3
    // const sellIsWeth = sellToken.priority === 3
    // const sellIsStable = sellToken.priority === 1 || sellToken.priority === 2
    const receiveIsVolatile = !receiveToken.priority
    const sellIsVolatile = !sellToken.priority
    const bothVolatile = !sellToken.priority && !receiveToken.priority
    // use defaults if no tokens or both are volatile (non-priority) tokens
    if (!sellToken || !receiveToken || bothVolatile) return false

    let showInversePrice = isInverse

    // IF: [WETH]/[STABLE] OR [VOLATILE]/[STABLE] OR [VOLATILE]/[WETH]
    // (sellIsStable || sellIsWeth) && (receiveIsVolatile || receiveIsWeth)
    if (!sellIsVolatile && (receiveIsVolatile || receiveIsWeth)) {
      showInversePrice = true
    }

    return showInversePrice
  }, [receiveToken, sellToken, isInverse])

  return showInverse
}

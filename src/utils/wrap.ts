import { WETH_ADDRESS_MAINNET, WETH_ADDRESS_RINKEBY, WXDAI_ADDRESS_XDAI } from 'const'
import { Network } from 'types'

export interface NativeTokenInfo {
  nativeToken: string
  wrappedToken: string
}

export function getIsWrappable(networkId: number, address: string): boolean {
  switch (networkId) {
    case Network.Mainnet:
      return address === WETH_ADDRESS_MAINNET
    case Network.Rinkeby:
      return address === WETH_ADDRESS_RINKEBY
    case Network.xDAI:
      return address === WXDAI_ADDRESS_XDAI
    default:
      return false
  }
}

export function getNativeTokenName(networkId?: number): NativeTokenInfo {
  if (networkId === Network.xDAI) {
    return {
      nativeToken: 'xDAI',
      wrappedToken: 'wxDAI',
    }
  } else {
    return {
      nativeToken: 'ETH',
      wrappedToken: 'WETH',
    }
  }
}

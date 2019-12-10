import React, { useMemo } from 'react'
import { WraptorComponent } from '@w3stside/wraptor'
import { useWalletConnection } from 'hooks/useWalletConnection'

import { tokenListApi } from 'api'
import { getToken } from 'utils'

import { Network } from 'types'

const WrapEther: React.FC = () => {
  const { blockNumber, userAddress, networkId, web3 } = useWalletConnection()

  const contractAddress = useMemo(() => {
    const fallBackNetworkId = networkId ? networkId : Network.Mainnet // fallback to mainnet
    const tokens = tokenListApi.getTokens(fallBackNetworkId)

    return getToken('symbol', 'WETH', tokens)?.address
  }, [networkId])

  return web3 && userAddress && networkId && contractAddress ? (
    <WraptorComponent
      type="ETH"
      provider={web3}
      contractAddress={contractAddress}
      userAddress={userAddress}
      catalyst={blockNumber}
      tokenDisplay={{
        name: 'Wrapped Ether',
        symbol: 'WETH',
        decimals: 18,
      }}
      customStyle={{
        'max-width': 650,
      }}
      header={(): JSX.Element => <code>WETH Wrapper & Unwrapper</code>}
    />
  ) : null
}

export default WrapEther

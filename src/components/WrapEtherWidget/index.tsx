import React, { useMemo } from 'react'
import { WraptorComponent } from '@w3stside/wraptor'
import { useWalletConnection } from 'hooks/useWalletConnection'

import { tokenListApi } from 'api'
import { Network } from 'types'

const WrapEther: React.FC = () => {
  const { userAddress, networkId, web3 } = useWalletConnection()

  const fallBackNetworkId = networkId ? networkId : Network.Mainnet // fallback to mainnet
  const tokens = useMemo(() => tokenListApi.getTokens(fallBackNetworkId), [fallBackNetworkId])

  const contractAddress = useMemo(() => tokens.find(token => token.symbol === 'WETH')?.address, [tokens])

  return web3 && userAddress && networkId && contractAddress ? (
    <WraptorComponent
      type="ETH"
      provider={web3}
      contractAddress={contractAddress}
      userAddress={userAddress}
      tokenDisplay={{
        name: 'Wrapped Ether',
        symbol: 'WETH',
        decimals: 18,
      }}
      header={(): JSX.Element => <code>WETH Wrapper & Unwrapper</code>}
    />
  ) : null
}

export default WrapEther

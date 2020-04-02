import React, { useEffect } from 'react'
import { ContentPage } from 'components/Layout/PageWrapper'
import OrderBookWidget from 'components/OrderBookWidget'
import TokenSelector from 'components/TokenSelector'
import { useTokenList } from 'hooks/useTokenList'
import { useWalletConnection } from 'hooks/useWalletConnection'
import { Network } from 'types'
import useSafeState from 'hooks/useSafeState'
import { TokenDetails } from 'types'

const OrderBook: React.FC = () => {
  const { networkId } = useWalletConnection()
  const fallBackNetworkId = networkId ? networkId : Network.Mainnet // fallback to mainnet
  const tokenList = useTokenList(fallBackNetworkId)
  const [baseToken, setBaseToken] = useSafeState<TokenDetails | null>(null)
  const [quoteToken, setQuoteToken] = useSafeState<TokenDetails | null>(null)

  const tokensLoaded = tokenList.length !== 0
  useEffect(() => {
    if (tokensLoaded) {
      if (baseToken === null) {
        setBaseToken(tokenList[0])
      }

      if (quoteToken === null) {
        setQuoteToken(tokenList[1])
      }
    }
  }, [baseToken, quoteToken, setBaseToken, setQuoteToken, tokenList, tokensLoaded])

  if (!tokensLoaded || baseToken === null || quoteToken === null) {
    return null
  }

  return (
    <ContentPage>
      <h1>Order book</h1>
      <TokenSelector tokens={tokenList} selected={baseToken} onChange={setBaseToken} />
      <TokenSelector tokens={tokenList} selected={quoteToken} onChange={setQuoteToken} />
      <OrderBookWidget baseToken={baseToken} quoteToken={quoteToken} networkId={fallBackNetworkId} />
    </ContentPage>
  )
}

export default OrderBook

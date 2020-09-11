import React, { useEffect, ChangeEvent, useMemo } from 'react'
import { ContentPage } from 'components/layout'
import OrderBookWidget from 'components/OrderBookWidget'
import TokenSelector from 'components/TokenSelector'
import { useTokenList } from 'hooks/useTokenList'
import { useWalletConnection } from 'hooks/useWalletConnection'
import useSafeState from 'hooks/useSafeState'
import { TokenDetails } from 'types'
import styled from 'styled-components'
import { Input } from 'components/Input'
import { MEDIA, ORDER_BOOK_HOPS_DEFAULT, ORDER_BOOK_HOPS_MAX } from 'const'
import InputBox from 'components/InputBox'

const OrderBookPage = styled(ContentPage)`
  padding: 2.4rem 0rem;
  min-height: initial;
  max-width: initial;
`

const OrderBookWrapper = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  flex-flow: row wrap;
  padding: 0 1.6rem 1.6rem;
  justify-content: space-between;

  > h1 {
    margin: 0 auto 0 0;
    width: auto;

    @media ${MEDIA.mobile} {
      width: 100%;
      margin: 0 auto 1rem;
      text-align: center;
    }
  }

  > span {
    display: flex;
    flex-flow: row wrap;
    align-items: center;
  }

  > span:first-of-type::after {
    content: '⟶';
    margin: 0 1rem;

    @media ${MEDIA.mobile} {
      display: none;
    }
  }

  > span:first-of-type > p {
    margin: 0 1rem 0 0;
  }

  > span:last-of-type > p {
    margin: 0 0 0 1rem;
  }

  ${InputBox} {
    padding: 0 0 0 3rem;

    input {
      padding: 0 1rem;
      max-width: 8em;
    }

    label {
      margin: 0 1rem;
      text-transform: capitalize;
      color: var(--color-text-primary);
      font-size: 1.5rem;
      font-weight: bold;
      line-height: 5rem;
    }
  }
`

const OrderBook: React.FC = () => {
  const { networkIdOrDefault } = useWalletConnection()
  // get all tokens
  const tokenList = useTokenList({ networkId: networkIdOrDefault })
  const [baseToken, setBaseToken] = useSafeState<TokenDetails | null>(null)
  const [quoteToken, setQuoteToken] = useSafeState<TokenDetails | null>(null)
  const [hops, setHops] = useSafeState(ORDER_BOOK_HOPS_DEFAULT)
  const [batchId, setBatchId] = useSafeState<number | undefined>(undefined)

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

  const { onBaseChange, onQuoteChange } = useMemo(
    () => ({
      onBaseChange: (newBaseToken: TokenDetails): void => {
        if (newBaseToken.address === quoteToken?.address) setQuoteToken(baseToken)
        setBaseToken(newBaseToken)
      },
      onQuoteChange: (newQuoteToken: TokenDetails): void => {
        if (newQuoteToken.address === baseToken?.address) setBaseToken(quoteToken)
        setQuoteToken(newQuoteToken)
      },
    }),
    [baseToken, quoteToken, setBaseToken, setQuoteToken],
  )

  if (!tokensLoaded || baseToken === null || quoteToken === null) {
    return null
  }

  return (
    <OrderBookPage>
      <OrderBookWrapper>
        <h1>Order book</h1>
        <span>
          <p>Bid</p> <TokenSelector tokens={tokenList} selected={baseToken} onChange={onBaseChange} />
        </span>
        <span>
          <TokenSelector tokens={tokenList} selected={quoteToken} onChange={onQuoteChange} /> <p>Ask</p>
        </span>
        <span>
          <InputBox>
            <label>Hops</label>
            <Input
              value={hops}
              type="number"
              min="0"
              max={ORDER_BOOK_HOPS_MAX.toString()}
              onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                const hopsValue = e.target.value
                if (hopsValue && !Number.isNaN(Number(hopsValue))) {
                  setHops(Number(hopsValue))
                }
              }}
            />
          </InputBox>
        </span>
        <span>
          <InputBox>
            <label>BatchId</label>
            <Input
              value={batchId || ''}
              type="number"
              min="0"
              onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                const batchIdValue = e.target.value
                if (batchIdValue && !Number.isNaN(Number(batchIdValue))) {
                  setBatchId(Number(batchIdValue))
                } else {
                  setBatchId(undefined)
                }
              }}
            />
          </InputBox>
        </span>
      </OrderBookWrapper>

      <OrderBookWidget
        baseToken={baseToken}
        quoteToken={quoteToken}
        networkId={networkIdOrDefault}
        hops={hops}
        batchId={batchId}
      />
    </OrderBookPage>
  )
}

export default OrderBook

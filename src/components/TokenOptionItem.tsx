import React, { useEffect } from 'react'
import { isAddress, toChecksumAddress } from 'web3-utils'
import { TokenImgWrapper } from './TokenImg'
import { tokenListApi, exchangeApi } from 'api'
import styled from 'styled-components'
import useSafeState from 'hooks/useSafeState'
import { TokenDetails } from '@gnosis.pm/dex-js'
import { TokenFromExchange } from 'services/factories'
import { getTokenFromErc20 } from 'services'
import { logDebug } from 'utils'

const OptionItemWrapper = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  text-align: initial;

  img {
    width: 3.6rem;
    height: 3.6rem;
    object-fit: contain;
    margin: 0;
  }

  .tokenDetails {
    display: flex;
    justify-content: space-between;
    width: inherit;

    .tokenName {
      display: flex;
      flex-direction: column;
      margin-left: 1rem;
    }
  }

  > div > div {
    font-weight: var(--font-weight-normal);
    font-size: 1.3rem;
    color: #476481;
    line-height: 1.1;
  }

  > div > div > strong {
    font-weight: var(--font-weight-bold);
    margin: 0;
    font-size: 1.6rem;
  }
`

interface OptionItemProps {
  image?: string
  name?: string
  symbol?: string
  children?: React.ReactNode
}

const OptionItemBase: React.FC<OptionItemProps> = ({ image, name, symbol, children }) => {
  return (
    <OptionItemWrapper>
      <TokenImgWrapper src={image} alt={name} />
      <div className="tokenDetails">
        <div className="tokenName">
          <div>
            <strong>{symbol}</strong>
          </div>
          <div>{name}</div>
        </div>
        {children}
      </div>
    </OptionItemWrapper>
  )
}

export const OptionItem = React.memo(OptionItemBase)

interface SearchItemProps {
  value: string
  defaultText?: string
  networkId: number
}

const testPAXG = {
  address: '0x45804880De22913dAFE09f4980848ECE6EcbAf78',
  symbol: 'PAXG',
  name: 'Paxos Gold',
  decimals: 18,
  id: 17,
  image:
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x45804880De22913dAFE09f4980848ECE6EcbAf78/logo.png',
}

interface TokenAndNetwork {
  tokenAddress: string
  networkId: number
}

type ValidResons =
  | TokenFromExchange.NOT_ERC20
  | TokenFromExchange.NOT_REGISTERED_ON_CONTRACT
  | TokenFromExchange.UNREGISTERED_ERC20

interface FetchTokenResult {
  token: TokenDetails | null
  reason: ValidResons | null
}

const fetchToken = async (params: TokenAndNetwork): Promise<FetchTokenResult> => {
  try {
    console.log('fetching Token')
    const tokenInExchange = await exchangeApi.hasToken(params)

    if (!tokenInExchange)
      return {
        token: null,
        reason: TokenFromExchange.NOT_REGISTERED_ON_CONTRACT,
      }

    const tokenId = await exchangeApi.getTokenIdByAddress(params)

    const erc20Token = await getTokenFromErc20(params)

    if (!erc20Token)
      return {
        token: null,
        reason: TokenFromExchange.NOT_ERC20,
      }

    return {
      token: {
        ...erc20Token,
        id: tokenId,
      },
      reason: TokenFromExchange.UNREGISTERED_ERC20,
    }
  } catch (error) {
    logDebug('Error fetching token', params, error)
    return {
      token: null,
      reason: null,
    }
  }
}

// cache fetched tokens
// even between remounts
// as SearchItem will be remounted often
const fetchedCache: Record<string, FetchTokenResult | undefined> = {}
const constructCacheKey = ({ tokenAddress, networkId }: TokenAndNetwork): string => {
  return tokenAddress.toLowerCase() + '|' + networkId
}

export const SearchItem: React.FC<SearchItemProps> = ({ value, defaultText, networkId }) => {
  const [fetchResult, setFetchResult] = useSafeState<FetchTokenResult | null>(null)

  useEffect(() => {
    // if truthy value, not already in the list and a valid address
    if (!value || tokenListApi.hasToken({ tokenAddress: value, networkId }) || !isAddress(value.toLowerCase())) return

    // when cache is hit, token display is immediate
    const cacheKey = constructCacheKey({ tokenAddress: value, networkId })
    const cachedResult = fetchedCache[cacheKey]
    if (cachedResult) {
      console.log('cachedResult', cachedResult, fetchedCache)
      setFetchResult(cachedResult)
      return
    }

    setFetchResult(null)

    fetchToken({ tokenAddress: toChecksumAddress(value), networkId }).then(result => {
      console.log('fetchResult', result)
      fetchedCache[cacheKey] = result
      setFetchResult(result)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.toLowerCase(), networkId, setFetchResult])

  if (
    !fetchResult ||
    !value ||
    tokenListApi.hasToken({ tokenAddress: value, networkId }) ||
    !isAddress(value.toLowerCase())
  ) {
    return <>{defaultText}</>
  }

  const { token, reason } = fetchResult

  switch (reason) {
    case TokenFromExchange.NOT_REGISTERED_ON_CONTRACT:
      return <>Register token on Exchange first</>
    case TokenFromExchange.NOT_ERC20:
      return <>Not a valid ERC20 token</>
    case TokenFromExchange.UNREGISTERED_ERC20:
      if (!token) return <>{defaultText}</>
      return (
        <OptionItem name={token.name} symbol={token.symbol} image={token.image}>
          <button onClick={console.log}>Add Token</button>
        </OptionItem>
      )
    default:
      return <>{defaultText}</>
  }
}

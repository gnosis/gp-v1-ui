import React, { useEffect } from 'react'
import { unstable_batchedUpdates as batchedUpdates } from 'react-dom'
import { isAddress } from 'web3-utils'
import { TokenImgWrapper } from './TokenImg'
import { tokenListApi } from 'api'
import styled from 'styled-components'
import useSafeState from 'hooks/useSafeState'
import { TokenDetails } from 'types'
import { TokenFromExchange } from 'services/factories'
import { fetchTokenData, FetchTokenResult, TokenAndNetwork } from 'services'
import { safeFilledToken } from 'utils'
import { toast } from 'toastify'
import { SimpleCache } from 'api/proxy/SimpleCache'
import { UseAddTokenModalResult } from 'hooks/useBetterAddTokenModal'

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
    align-items: center;
    align-content: center;
    flex-flow: row nowrap;

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

const ExtraOptionsMessage = styled.a`
  align-self: flex-end;
  margin: auto 0;
  font-size: 1.3rem;
  line-height: 1.2;
  text-align: right;
`

interface OptionItemProps {
  image?: string
  name?: string
  symbol?: string
}

// generic component to display token
// with custom children option
export const OptionItem: React.FC<OptionItemProps> = ({ image, name, symbol, children }) => {
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

interface SearchItemProps {
  value: string
  defaultText?: string
  networkId: number
  addTokensToList: UseAddTokenModalResult['addTokensToList']
}

const notifyOfNewToken = (token: TokenDetails): void => {
  const { symbol: tokenDisplayName } = safeFilledToken(token)
  toast.success(`The token ${tokenDisplayName} has been enabled for trading`)
}

// cache fetched tokens
// even between remounts
// as SearchItem will be remounted often
const constructCacheKey = ({ tokenAddress, networkId }: TokenAndNetwork): string => {
  return tokenAddress.toLowerCase() + '|' + networkId
}

const fetchedCache = new SimpleCache<FetchTokenResult, TokenAndNetwork>(constructCacheKey)
const promisedCache = new SimpleCache<Promise<FetchTokenResult>, TokenAndNetwork>(constructCacheKey)

interface GenerateMessageParams {
  fetchResult: FetchTokenResult
  addTokensToList: UseAddTokenModalResult['addTokensToList']
  networkId: number
  defaultText?: string
}

const generateMessage = ({
  fetchResult,
  addTokensToList,
  networkId,
  defaultText,
}: GenerateMessageParams): React.ReactElement => {
  const { token, reason } = fetchResult

  switch (reason) {
    // not registered --> advise to register
    case TokenFromExchange.NOT_REGISTERED_ON_CONTRACT:
      if (!token)
        return (
          <a href="https://docs.gnosis.io/protocol/docs/addtoken1/" rel="noopener noreferrer" target="_blank">
            Register token on Exchange first
          </a>
        )
      return (
        <OptionItem name={token.name} symbol={token.symbol} image={token.image}>
          <ExtraOptionsMessage
            href="https://docs.gnosis.io/protocol/docs/addtoken1/"
            rel="noopener noreferrer"
            target="_blank"
          >
            Register token on Exchange first
          </ExtraOptionsMessage>
        </OptionItem>
      )
    // not a ERC20 --> can't do much
    case TokenFromExchange.NOT_ERC20:
      return <>Not a valid ERC20 token</>
    // registered but not in list --> option to add
    case TokenFromExchange.NOT_IN_TOKEN_LIST:
      if (!token || !('id' in token)) return <>{defaultText}</>

      const handleAddToken: React.MouseEventHandler<HTMLButtonElement> = async e => {
        // prevent react-select reaction
        e.preventDefault()
        const [newToken] = await addTokensToList({ networkId, tokens: [token] }, reason)
        if (!newToken) return

        notifyOfNewToken(newToken)

        // clear cache as token is in list now
        fetchedCache.delete({ tokenAddress: token.address, networkId })
      }

      return (
        <OptionItem name={token.name} symbol={token.symbol} image={token.image}>
          <button onClick={handleAddToken}>Add Token</button>
        </OptionItem>
      )
    default:
      return <>{defaultText}</>
  }
}

// checks if token address is a valid address and not already in the list
const checkIfAddableAddress = (tokenAddress: string, networkId: number): boolean =>
  !!tokenAddress && !tokenListApi.hasToken({ tokenAddress, networkId }) && isAddress(tokenAddress.toLowerCase())

export const SearchItem: React.FC<SearchItemProps> = ({ value, defaultText, networkId, addTokensToList }) => {
  const [isFetching, setIsFetching] = useSafeState(false)
  // cached values can be retieved on first render already
  const [fetchResult, setFetchResult] = useSafeState<FetchTokenResult | null>(() => {
    if (!checkIfAddableAddress(value, networkId)) return null

    // check cache on mount
    // to avoid `No results` flash on remount
    return fetchedCache.get({ tokenAddress: value, networkId }) || null
  })

  useEffect(() => {
    // if truthy value, not already in the list and a valid address
    if (!checkIfAddableAddress(value, networkId)) return

    // when cache is hit, token display is immediate
    const cacheKey = { tokenAddress: value, networkId }
    const cachedResult = fetchedCache.get(cacheKey)
    if (cachedResult) {
      setFetchResult(cachedResult)
      return
    }

    // value can change during fetch
    // then fetch result becomes stale
    let cancelled = false
    // fetching indicator on
    setIsFetching(true)

    let promise = promisedCache.get(cacheKey)

    if (!promise) {
      promise = fetchTokenData({ tokenAddress: value, networkId })
      promisedCache.set(promise, cacheKey)
    }

    promise
      .then(result => {
        // cache result
        fetchedCache.set(result, cacheKey)
        //bust promised cache
        promisedCache.delete(cacheKey)

        batchedUpdates(() => {
          if (!cancelled) setFetchResult(result)
          // fetching indicator off
          setIsFetching(false)
        })
      })
      .catch(() => promisedCache.delete(cacheKey))

    return (): void => {
      cancelled = true
      setIsFetching(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.toLowerCase(), networkId, setFetchResult])
  // don't differentiate based on case

  if (isFetching) return <>Checking token address...</>

  if (
    // if nothing fetched
    !fetchResult ||
    // or no input at all
    !value ||
    // or token in list
    // !fetchResult && guards agains race condition when updated list propagates through hooks
    (!fetchResult && tokenListApi.hasToken({ tokenAddress: value, networkId })) ||
    // or not a valid address
    !isAddress(value.toLowerCase())
  ) {
    return <>{defaultText}</>
  }

  return generateMessage({ fetchResult, addTokensToList, networkId, defaultText })
}

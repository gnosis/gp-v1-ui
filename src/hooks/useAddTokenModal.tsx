import React, { useState, useCallback, useRef, useEffect } from 'react'
import { toChecksumAddress } from 'web3-utils'
import Modali, { useModali, ModalHook } from 'modali'
import { TokenAndNetwork, getTokenFromExchangeByAddress } from 'services'
import { toast } from 'toastify'
import { safeFilledToken, logDebug, Deferred, createDeferredPromise } from 'utils'
import { TokenDetails } from 'types'
import TokenImg from '../components/TokenImg'
import styled from 'styled-components'
import { tokenListApi } from 'api'
import { TokenFromExchangeResult, TokenFromExchange } from 'services/factories'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { unstable_batchedUpdates as batchUpdates } from 'react-dom'

const addTokenFromInput = async (
  { networkId, tokenAddress }: TokenAndNetwork,
  tokenPromised: Promise<TokenDetails | null>,
): Promise<TokenDetails | null> => {
  try {
    const token = await tokenPromised

    if (token) {
      logDebug('Added new Token to userlist', token)

      tokenListApi.addToken({ token, networkId })
    } else {
      const error = `Token at address ${tokenAddress} not available in Exchange contract`
      toast.warn(error)
      throw new Error(error)
    }

    const { symbol: tokenDisplayName } = safeFilledToken(token)

    toast.success(`The token ${tokenDisplayName} has been enabled for trading`)
    return token
  } catch (error) {
    logDebug('Error adding token', tokenAddress, error)
    throw error
  }
}

export const ModalBodyWrapper = styled.div`
  p {
    line-height: 1.8;
  }

  min-height: 15rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

interface TokenAddConfirmationProps {
  tokenAddress: string
  networkId: number
}

const TokenAddConfirmation: React.FC<TokenAddConfirmationProps> = ({ tokenAddress }) => {
  return (
    <ModalBodyWrapper>
      <div>
        <p>Do you want to add {tokenAddress} to your local list of tokens?</p>
      </div>
    </ModalBodyWrapper>
  )
}

interface TokenAddResultProps {
  token: TokenDetails
}

const TokenDisplay = styled.div`
  display: grid;
  align-items: center;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  grid-template-areas:
    'image symbol'
    'image name';

  .tokenImage {
    grid-area: image;
    height: 5em;
    width: 5em;
  }

  .tokenSymbol {
    grid-area: symbol;
  }

  .tokenName {
    grid-area: name;
  }
`

const CenteredContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;

  ${TokenDisplay} {
    margin: auto;
  }
`

const TokeAddResult: React.FC<TokenAddResultProps> = ({ token }) => {
  return (
    <ModalBodyWrapper>
      <CenteredContent>
        <h2>Added token</h2>
        <TokenDisplay>
          <TokenImg src={token.image} alt={token.name} className="tokenImage" />
          <div className="tokenSymbol">
            <strong>{token.symbol}</strong>
          </div>
          <div className="tokenName">{token.name}</div>
        </TokenDisplay>
      </CenteredContent>
    </ModalBodyWrapper>
  )
}

interface ErrorProps {
  error: string
}

const ErrorDisplay: React.FC<ErrorProps> = ({ error }) => {
  return (
    <ModalBodyWrapper>
      <p>{error}</p>
    </ModalBodyWrapper>
  )
}

interface GenerateMessageParams extends TokenAddConfirmationProps {
  token: TokenDetails | null
  error: Error | null
}

const generateMessage = ({ token, tokenAddress, networkId, error }: GenerateMessageParams): React.ReactNode => {
  if (error) return <ErrorDisplay error={error.message} />
  if (token) return <TokeAddResult token={token} />
  if (tokenAddress && networkId) return <TokenAddConfirmation tokenAddress={tokenAddress} networkId={networkId} />
  return null
}

const spinner = <FontAwesomeIcon icon={faSpinner} style={{ marginRight: 7 }} spin />

interface UseAddTokenModalResult {
  addTokenToList: (params: TokenAddConfirmationProps) => Promise<TokenDetails | null>
  modalProps: ModalHook
}

export const useAddTokenModal = (): UseAddTokenModalResult => {
  const [networkId, setNetworkId] = useState(0)
  const [tokenAddress, setTokenAddress] = useState('')

  // using deferred promise that will be resolved separately
  const result = useRef<Deferred<TokenDetails | null>>()
  // to faster show the Token on Confirm, prefetch sooner
  const prefetchToken = useRef<Promise<TokenFromExchangeResult | null>>(Promise.resolve(null))
  const [token, setToken] = useState<TokenDetails | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const [isProcessing, setIsProcessing] = useState(false)

  const [modalProps, toggleModal] = useModali({
    animated: true,
    centered: true,
    title: isProcessing ? spinner : 'Are you sure?',
    message: generateMessage({ token, tokenAddress, networkId, error }),
    buttons: [
      token || error ? (
        <>&nbsp;</> // must be an element for spacing
      ) : (
        <Modali.Button
          label="Cancel"
          key="no"
          isStyleCancel
          onClick={(): void => {
            result.current?.resolve(null)
          }}
        />
      ),
      <Modali.Button
        label={token || error ? 'Done' : 'Confirm'}
        key="yes"
        isStyleDefault
        onClick={(): void => {
          if (isProcessing) return

          if (token) {
            // have fetched token -> added already -> resolve deferred -> close modal
            result.current?.resolve(token)
          } else if (error) {
            // have failed adding token -> nothing more to do -> resolve deferred -> close modal
            result.current?.resolve(null)
          } else {
            setIsProcessing(true)
            // nothing done yet -> step 1 -- add token to list
            const prefetchedTokenWithRetry = prefetchToken.current
              .then(result => {
                // retry logic because we may have been between providers
                // when adding token right away from URL on page load
                // and lastProvider not yet connected
                if (result?.token || result?.reason !== TokenFromExchange.NOT_REGISTERED_ON_CONTRACT) return result

                return getTokenFromExchangeByAddress({ tokenAddress, networkId })
              })
              .then(result => result && result.token)

            addTokenFromInput({ networkId, tokenAddress }, prefetchedTokenWithRetry).then(
              token => {
                batchUpdates(() => {
                  setToken(token)
                  setIsProcessing(false)
                })
              },
              error => {
                setError(error)
                setIsProcessing(false)
              },
            )
          }
        }}
      />,
    ],
  })

  // toggleModal recreated every time, keep ref to use in Promise.then
  const toggleRef = useRef(toggleModal)
  toggleRef.current = toggleModal

  const addTokenToList = useCallback(
    ({ networkId, tokenAddress }: TokenAddConfirmationProps): Promise<TokenDetails | null> => {
      setNetworkId(networkId)
      const checkSumAddress = toChecksumAddress(tokenAddress)
      setTokenAddress(checkSumAddress)

      // start deferred promise to be resolved later
      const deferred = createDeferredPromise<TokenDetails | null>()
      result.current = deferred

      // fetch token as soon as we have tokenAddress
      prefetchToken.current = getTokenFromExchangeByAddress({ tokenAddress: checkSumAddress, networkId })

      toggleRef.current()

      return deferred.promise.then(value => {
        // close modal
        toggleRef.current()

        // reset hook state
        result.current = undefined

        return value
      })
    },
    [],
  )

  useEffect(() => {
    if (!modalProps.isModalVisible) {
      // reset hook state
      // only after modal closed to avoid rerendering not-yet closed modal
      // also visible layout thrashing
      setNetworkId(0)
      setTokenAddress('')
      setToken(null)
      setError(null)
      setIsProcessing(false)
    }
  }, [modalProps.isModalVisible])

  return {
    addTokenToList,
    modalProps,
  }
  //  can be used like
  // const added: boolean = await addTokenToList({tokenAddress, networkId})
}

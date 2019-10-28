import React, { useState, useRef, useEffect } from 'react'
import { withRouter, RouteComponentProps } from 'react-router'
import { toast } from 'react-toastify'
// @ts-ignore
import { CopyToClipboard } from 'react-copy-to-clipboard'
import QRCode from 'qrcode.react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faSpinner,
  faSignOutAlt,
  faSignInAlt,
  faCopy,
  faCheck,
  faChevronCircleDown,
  faChevronCircleUp,
} from '@fortawesome/free-solid-svg-icons'

import { EtherscanLink } from './EtherscanLink'

import { walletApi } from 'api'
import { useWalletConnection } from 'hooks/useWalletConnection'
import { abbreviateString, getNetworkFromId } from 'utils'

import WalletImg from 'img/unknown-token.png'

const Wrapper = styled.div<{ walletOpen: boolean }>`
  position: relative;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  margin: 1rem;
  width: 20rem;

  background: ghostwhite;
  border-radius: ${(props): string => (props.walletOpen ? '10px 10px 0 0' : '10px')};

  text-align: center;
`

const WalletItem = styled.div`
  color: #000;
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: space-evenly;
  margin: 0.3rem auto;
  padding: 1rem;
  width: 92%;
`

const ThinWalletItem = styled(WalletItem)`
  margin: 5px auto;
  padding: 2px 0;
`

const WalletToggler = styled(WalletItem)`
  cursor: pointer;
  border-top: 2px solid #00000029;
  padding: 6px;
`

const CopyDiv = styled.div`
  background: #90ee90ad;
  border-radius: 50px;
  font-size: 75%;
  width: 80%;
`

const WalletSlideWrapper = styled.div`
  position: absolute;
  background: inherit;
  width: 100%;
  top: 100%;
  box-shadow: 5px 19px 16px #00000033;
  border-radius: 0 0 10px 10px;
`

const MonospaceText = styled.div<{ color?: string }>`
  color: ${(props): string => props.color || '#283baf'};
  font-weight: 800;
  font-family: monospace;
`

const MonospaceAddress = styled(MonospaceText)`
  font-size: 85%;
  margin: 0 10px;
  word-break: break-all;
`

interface WalletProps extends RouteComponentProps {
  className: string
}

const Wallet: React.FC<RouteComponentProps> = (props: WalletProps) => {
  const { isConnected, userAddress, networkId } = useWalletConnection()

  const [loadingLabel, setLoadingLabel] = useState()
  const [copiedToClipboard, setCopiedToClipboard] = useState(false)
  const [showWallet, setShowWallet] = useState(false)

  const mounted = useRef(true)

  useEffect(() => {
    return function cleanUp(): void {
      mounted.current = false
    }
  }, [])

  /***************************** */
  // EVENT HANDLERS

  const connectWallet = async (): Promise<void> => {
    try {
      setLoadingLabel('Connecting...')
      await walletApi.connect()
      toast.success('Wallet connected')
    } catch (error) {
      console.error('error', error)
      toast.error('Error connecting wallet')
    } finally {
      if (mounted.current) {
        setLoadingLabel(undefined)
      }
    }
  }

  const disconnectWallet = async (): Promise<void> => {
    try {
      setLoadingLabel('Disconnecting...')
      await walletApi.disconnect()
      toast.info('Wallet disconnected')
    } catch (error) {
      toast.error('Error disconnecting wallet')
    } finally {
      setLoadingLabel(undefined)
      props.history.push('/')
    }
  }

  const handleCopyToClipBoard = (): NodeJS.Timeout => {
    setCopiedToClipboard(true)
    return setTimeout((): void => setCopiedToClipboard(false), 5000)
  }

  /***************************** */
  // RENDER FUNCTIONS

  const renderLogInOutButton = (): JSX.Element => {
    let onClick, content
    if (loadingLabel) {
      content = (
        <>
          <FontAwesomeIcon icon={faSpinner} spin />
          {' ' + loadingLabel}
        </>
      )
    } else if (isConnected) {
      onClick = disconnectWallet
      content = (
        <>
          <FontAwesomeIcon icon={faSignOutAlt} />
          <strong> Log Out</strong>
        </>
      )
    } else {
      onClick = connectWallet
      content = (
        <>
          <FontAwesomeIcon icon={faSignInAlt} />
          <strong> Connect Wallet</strong>
        </>
      )
    }

    return (
      <WalletItem>
        <a onClick={onClick} className={props.className}>
          {content}
        </a>
      </WalletItem>
    )
  }

  return (
    <Wrapper walletOpen={showWallet}>
      {userAddress ? (
        <>
          {/* Network */}
          <ThinWalletItem>
            <MonospaceText>{getNetworkFromId(networkId)}</MonospaceText>
          </ThinWalletItem>
          {/* Wallet logo + address + chevron */}
          <WalletToggler onClick={(): void => setShowWallet(!showWallet)}>
            <img src={WalletImg} style={{ maxWidth: '15%' }} />
            <div>{userAddress && abbreviateString(userAddress, 6, 4)}</div>
            <FontAwesomeIcon
              icon={showWallet ? faChevronCircleUp : faChevronCircleDown}
              style={{ cursor: 'pointer' }}
            />
          </WalletToggler>
        </>
      ) : (
        renderLogInOutButton()
      )}
      {/* Main elements of Wallet: QR, Address copy, Etherscan URL, Log Out */}
      {userAddress && showWallet && (
        <WalletSlideWrapper>
          <WalletItem>
            <QRCode size={100} value={userAddress} />
          </WalletItem>
          <WalletItem>
            {/* Copy Confirmation */}
            {copiedToClipboard ? (
              <CopyDiv>
                <FontAwesomeIcon color="#ff5097" icon={faCheck} /> <span>Copied!</span>
              </CopyDiv>
            ) : (
              // Address and copy button
              <>
                <MonospaceAddress color="#000">{userAddress} </MonospaceAddress>
                <CopyToClipboard text={userAddress} onCopy={handleCopyToClipBoard}>
                  <FontAwesomeIcon
                    color="#ff5097"
                    icon={faCopy}
                    style={{ cursor: 'pointer' }}
                    title="Copy address to clipboard"
                  />
                </CopyToClipboard>
              </>
            )}
          </WalletItem>
          {/* Etherscan Link */}
          {
            <WalletItem>
              {/* TODO: add network specific */}
              <EtherscanLink type="address" identifier={userAddress} label="View on Etherscan" />
            </WalletItem>
          }
          {/* Log In/Out Button */}
          {renderLogInOutButton()}
        </WalletSlideWrapper>
      )}
    </Wrapper>
  )
}

export default withRouter(Wallet)

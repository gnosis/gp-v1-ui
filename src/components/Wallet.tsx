import React from 'react'
import { withRouter, RouteComponentProps, useRouteMatch } from 'react-router'
import { toast } from 'react-toastify'
import CopyToClipboard from 'react-copy-to-clipboard'
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
import useSafeState from 'hooks/useSafeState'

import { abbreviateString, getNetworkFromId } from 'utils'
// TODO: probably not do this
import { ETHER_PNG } from 'const'
// import WalletImg from 'assets/img/unknown-token.png'

export const WalletWrapper = styled.div<{ $walletOpen: boolean }>`
  position: relative;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  margin: 1rem;
  padding: 6px 13px;

  background: ghostwhite;
  border-radius: ${({ $walletOpen }): string => ($walletOpen ? '10px 10px 0 0' : '10px')};

  line-height: 1;
  text-align: center;
`

const WalletItem = styled.div<{ $padding?: string; $wordWrap?: string }>`
  color: #000;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
  margin: auto;
  padding: ${({ $padding = '1rem 0.2rem' }): string => $padding};
  width: 92%;

  white-space: ${({ $wordWrap = 'initial' }): string => $wordWrap};

  > * {
    margin: 0 6px;
  }
`

const WalletToggler = styled(WalletItem)`
  cursor: pointer;
  padding: 6px;
`
const EtherImage = styled.img`
  max-width: 10%;
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
  left: 0;
  box-shadow: var(--box-shadow);
  border-radius: 0 0 10px 10px;
  z-index: 2;
`

const NetworkTitle = styled.div<{ $color?: string; $fontSize?: string }>`
  color: ${({ color = '#000' }): string => color};
  font-size: ${({ $fontSize = '1.15rem' }): string => $fontSize};
  font-weight: 800;
`

const MonospaceAddress = styled(NetworkTitle)`
  margin: 0 10px;
  font-family: 'monospace';
  font-size: 85%;
  font-weight: 100;
  word-break: break-all;
`

interface WalletProps extends RouteComponentProps {
  className: string
}

const Wallet: React.FC<RouteComponentProps> = (props: WalletProps) => {
  const { isConnected, userAddress, networkId } = useWalletConnection()

  const [loadingLabel, setLoadingLabel] = useSafeState<string | null>(null)
  const [copiedToClipboard, setCopiedToClipboard] = useSafeState(false)
  const [showWallet, setShowWallet] = useSafeState(false)

  const tradePageMatch = useRouteMatch('/trade/')

  /***************************** */
  // EVENT HANDLERS

  const connectWallet = async (): Promise<void> => {
    try {
      setLoadingLabel('Connecting...')
      const success = await walletApi.connect()

      // user closed Provider selection modal
      if (!success) return

      toast.success('Wallet connected')
    } catch (error) {
      console.error('error', error)
      toast.error('Error connecting wallet')
    } finally {
      setLoadingLabel(null)
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
      setLoadingLabel(null)
      if (!tradePageMatch) {
        props.history.push('/')
      }
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
        <WalletItem $padding="0px" $wordWrap="nowrap">
          <FontAwesomeIcon icon={faSignInAlt} />
          <strong> Connect Wallet</strong>
        </WalletItem>
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
    <WalletWrapper $walletOpen={!!(showWallet && userAddress)}>
      {userAddress ? (
        <>
          {/* Network */}
          <WalletItem $padding="6px">
            <NetworkTitle>{(networkId && getNetworkFromId(networkId)) || 'Unknown Network'}</NetworkTitle>
          </WalletItem>
          {/* Wallet logo + address + chevron */}
          <WalletToggler onClick={(): void => setShowWallet(!showWallet)}>
            <EtherImage src={ETHER_PNG} />
            <div>{userAddress && abbreviateString(userAddress, 6, 4)}</div>
            <FontAwesomeIcon icon={showWallet ? faChevronCircleUp : faChevronCircleDown} size="xs" />
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
                <FontAwesomeIcon color="#ff62a2;" icon={faCheck} /> <span>Copied!</span>
              </CopyDiv>
            ) : (
              // Address and copy button
              <>
                <MonospaceAddress color="#000">{userAddress} </MonospaceAddress>
                <CopyToClipboard text={userAddress} onCopy={handleCopyToClipBoard}>
                  <FontAwesomeIcon
                    color="#ff62a2;"
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
    </WalletWrapper>
  )
}

export default withRouter(Wallet)

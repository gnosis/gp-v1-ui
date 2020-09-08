/* eslint-disable react/prop-types */
import React, { useCallback } from 'react'
import { RouteComponentProps, useRouteMatch } from 'react-router'
import CopyToClipboard from 'react-copy-to-clipboard'
import QRCode from 'qrcode.react'

// assets
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignOutAlt, faSignInAlt, faCopy, faCheck, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'

// components
import { EtherscanLink } from 'components/common/EtherscanLink'

import {
  UserWalletItem,
  UserWalletWrapper,
  UserAddress,
  NetworkTitle,
  UserWalletToggler,
  EtherImage,
  UserWalletSlideWrapper,
  CopyDiv,
  MonospaceAddress,
  LogInOutButton,
  WalletName,
  WalletImage,
  EtherscanButton,
} from './UserWallet.styled'

import { useWalletConnection } from 'hooks/useWalletConnection'
import useSafeState from 'hooks/useSafeState'
import { useConnectWallet } from 'hooks/useConnectWallet'
import useNoScroll from 'hooks/useNoScroll'

import { abbreviateString, getNetworkFromId } from 'utils'
// TODO: probably not do this
import WalletImg from 'assets/img/eth-network.svg'
import { Spinner } from 'components/common/Spinner'
import { walletApi } from 'api'

interface UserWalletProps extends RouteComponentProps {
  className: string
}

const UserWallet: React.FC<RouteComponentProps> = (props: UserWalletProps) => {
  const { isConnected, userAddress, networkId } = useWalletConnection()

  const [loadingLabel, setLoadingLabel] = useSafeState<string | null>(null)
  const [copiedToClipboard, setCopiedToClipboard] = useSafeState(false)
  const [showWallet, setShowWallet] = useSafeState(false)
  const { connectWallet: _connectWallet, disconnectWallet: _disconnectWallet } = useConnectWallet()

  const orderPageMatch = useRouteMatch('/order/')

  // providerInfo is cached, so ok to re-get on render
  const { walletName, walletIcon } = walletApi.getProviderInfo() || {}

  useNoScroll(showWallet)

  /***************************** */
  // EVENT HANDLERS

  const connectWallet = useCallback(async (): Promise<void> => {
    setLoadingLabel('Connecting...')

    await _connectWallet()

    setLoadingLabel(null)
    setShowWallet(false)
  }, [_connectWallet, setLoadingLabel, setShowWallet])

  const disconnectWallet = useCallback(async (): Promise<void> => {
    setLoadingLabel('Disconnecting...')

    await _disconnectWallet()

    setLoadingLabel(null)
    setShowWallet(false)

    if (!orderPageMatch) {
      props.history.push('/')
    }
  }, [_disconnectWallet, orderPageMatch, props.history, setLoadingLabel, setShowWallet])

  const handleCopyToClipBoard = useCallback((): NodeJS.Timeout => {
    setCopiedToClipboard(true)
    return setTimeout((): void => setCopiedToClipboard(false), 5000)
  }, [setCopiedToClipboard])

  /***************************** */
  // RENDER FUNCTIONS

  const renderLogInOutButton = useCallback((): JSX.Element => {
    let onClick, content
    if (loadingLabel) {
      content = (
        <>
          <Spinner />
          {' ' + loadingLabel}
        </>
      )
    } else if (isConnected) {
      onClick = disconnectWallet
      content = (
        <>
          <FontAwesomeIcon icon={faSignOutAlt} />
          <strong> Disconnect Wallet</strong>
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
      <LogInOutButton $loggedIn={isConnected}>
        <a onClick={onClick} className={props.className}>
          {content}
        </a>
      </LogInOutButton>
    )
  }, [connectWallet, disconnectWallet, isConnected, loadingLabel, props.className])

  return (
    <UserWalletWrapper>
      {userAddress ? (
        <>
          {/* Wallet logo + address + chevron */}
          <UserWalletToggler onClick={(): void => setShowWallet(!showWallet)} className={showWallet ? 'visible' : ''}>
            {walletIcon ? <WalletImage src={walletIcon} /> : <EtherImage src={WalletImg} />}
            <UserAddress>
              {abbreviateString(userAddress, 6, 4)}
              {/* Network */}
              <NetworkTitle>
                {/* Don't output MAINNET, only other networks. */}
                {networkId
                  ? getNetworkFromId(networkId) === 'Mainnet'
                    ? ''
                    : getNetworkFromId(networkId)
                  : 'Unknown Network'}
              </NetworkTitle>
              {walletName && <WalletName>{walletName}</WalletName>}
            </UserAddress>
          </UserWalletToggler>
        </>
      ) : (
        renderLogInOutButton()
      )}
      {/* Main elements of Wallet: QR, Address copy, Etherscan URL, Log Out */}
      {userAddress && showWallet && (
        <UserWalletSlideWrapper>
          <button type="button" onClick={(): void => setShowWallet(false)}>
            <b>Wallet</b>
            <i>×</i>
          </button>
          <UserWalletItem>
            {/* Copy Confirmation */}
            {copiedToClipboard ? (
              <CopyDiv>
                <FontAwesomeIcon color="#ff62a2;" icon={faCheck} /> <span>Copied!</span>
              </CopyDiv>
            ) : (
              ''
            )}
            {/* // Address and copy button */}
            <MonospaceAddress onClick={handleCopyToClipBoard}>
              <b>{userAddress && userAddress.substring(0, 6)}</b>
              {userAddress.substring(6, userAddress.length - 4)}
              <b>{userAddress.slice(-4)}</b>
              <CopyToClipboard text={userAddress} onCopy={handleCopyToClipBoard}>
                <FontAwesomeIcon
                  color="#ff62a2;"
                  icon={faCopy}
                  style={{ cursor: 'pointer' }}
                  title="Copy address to clipboard"
                />
              </CopyToClipboard>
            </MonospaceAddress>
            <QRCode className="QRCode" value={userAddress} renderAs="svg" size={150} />
            {/* Etherscan Link */}
            {/* TODO: add network specific */}
            <EtherscanButton>
              <EtherscanLink
                className="etherscanLink"
                type="address"
                identifier={userAddress}
                label={
                  <>
                    <FontAwesomeIcon icon={faExternalLinkAlt} /> <span>View on Etherscan</span>
                  </>
                }
              />
            </EtherscanButton>
            {/* Log In/Out Button */}
            {renderLogInOutButton()}
          </UserWalletItem>
        </UserWalletSlideWrapper>
      )}
    </UserWalletWrapper>
  )
}

export default UserWallet

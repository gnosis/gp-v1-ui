import React from 'react'
import { RouteComponentProps, useRouteMatch } from 'react-router'
import { toast } from 'toastify'
import CopyToClipboard from 'react-copy-to-clipboard'
import QRCode from 'qrcode.react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faSignOutAlt, faSignInAlt, faCopy, faCheck } from '@fortawesome/free-solid-svg-icons'

import { EtherscanLink } from '../EtherscanLink'
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
  ConnectWallet,
  LogInOutButton,
} from './UserWallet.styled'

import { walletApi } from 'api'
import { useWalletConnection } from 'hooks/useWalletConnection'
import useSafeState from 'hooks/useSafeState'

import { abbreviateString, getNetworkFromId } from 'utils'
// TODO: probably not do this
import WalletImg from 'assets/img/eth-network.svg'

interface UserWalletProps extends RouteComponentProps {
  className: string
}

const UserWallet: React.FC<RouteComponentProps> = (props: UserWalletProps) => {
  const { isConnected, userAddress, networkId } = useWalletConnection()

  const [loadingLabel, setLoadingLabel] = useSafeState<string | null>(null)
  const [copiedToClipboard, setCopiedToClipboard] = useSafeState(false)
  const [showWallet, setShowWallet] = useSafeState(false)

  const orderPageMatch = useRouteMatch('/order/')

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
      console.error('[WalletComponent] Connect wallet error', error)
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
      if (!orderPageMatch) {
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
        <ConnectWallet className="connectWallet">
          <FontAwesomeIcon icon={faSignInAlt} />
          <strong> Connect Wallet</strong>
        </ConnectWallet>
      )
    }

    return (
      <LogInOutButton>
        <a onClick={onClick} className={props.className}>
          {content}
        </a>
      </LogInOutButton>
    )
  }

  return (
    <UserWalletWrapper $walletOpen={!!(showWallet && userAddress)}>
      {userAddress ? (
        <>
          {/* Wallet logo + address + chevron */}
          <UserWalletToggler onClick={(): void => setShowWallet(!showWallet)} className={showWallet ? 'visible' : ''}>
            <EtherImage src={WalletImg} />
            <UserAddress>
              {userAddress && abbreviateString(userAddress, 6, 4)}
              {/* Network */}
              <NetworkTitle>
                {/* Don't output MAINNET, only other networks. */}
                {networkId
                  ? getNetworkFromId(networkId) === 'Mainnet'
                    ? ''
                    : getNetworkFromId(networkId)
                  : 'Unknown Network'}
              </NetworkTitle>
            </UserAddress>
          </UserWalletToggler>
        </>
      ) : (
        renderLogInOutButton()
      )}
      {/* Main elements of Wallet: QR, Address copy, Etherscan URL, Log Out */}
      {userAddress && showWallet && (
        <UserWalletSlideWrapper>
          <button onClick={(): void => setShowWallet(!showWallet)}>
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
            <MonospaceAddress>
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
            <QRCode className="QRCode" value={userAddress} renderAs="svg" />
            {/* Etherscan Link */}
            {/* TODO: add network specific */}
            <EtherscanLink
              className="etherscanLink"
              type="address"
              identifier={userAddress}
              label="View on Etherscan"
            />
            {/* Log In/Out Button */}
            {renderLogInOutButton()}
          </UserWalletItem>
        </UserWalletSlideWrapper>
      )}
    </UserWalletWrapper>
  )
}

export default UserWallet

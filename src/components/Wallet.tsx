import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { toast } from 'react-toastify'

import { walletApi } from 'api'
import { useWalletConnection } from 'hooks/useWalletConnection'
import { withRouter, RouteComponentProps } from 'react-router'
import { abbreviateString } from 'utils'

interface WalletProps extends RouteComponentProps {
  className: string
}

const Wallet: React.FC<RouteComponentProps> = (props: WalletProps) => {
  const { isConnected, userAddress } = useWalletConnection()
  const [loadingLabel, setLoadingLabel] = useState()
  const mounted = useRef(true)

  useEffect(() => {
    return function cleanUp(): void {
      mounted.current = false
    }
  }, [])

  const connectWallet = async (): Promise<void> => {
    try {
      setLoadingLabel('Connecting...')
      await walletApi.connect()
      toast.success('Wallet connected')
    } catch (error) {
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
        {abbreviateString(userAddress, 10, 5)} &nbsp;<small>(disconnect)</small>
      </>
    )
  } else {
    onClick = connectWallet
    content = 'Connect to Wallet'
  }

  return (
    <a onClick={onClick} className={props.className}>
      {content}
    </a>
  )
}

export default styled(withRouter(Wallet))`
  padding: 1rem;
  margin: 1rem;
  border: 2px solid #ff5097;
  color: #ff5097;
  vertical-align: middle;
  text-decoration: none;
  min-width: 16em;
  text-align: center;

  &:hover {
    color: #ff5097;
  }

  &:hover {
    background-color: #ffe3ee;
  }
`

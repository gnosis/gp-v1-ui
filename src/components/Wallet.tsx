import React, { useState } from 'react'
import styled from 'styled-components'
import { walletApi } from 'api'

const Wrapper = styled.a`
  padding: 1rem;
  margin: 1rem;
  border: 2px solid #ff5097;
  color: #ff5097;
  vertical-align: middle;

  &:hover {
    color: white;
    border-color: white;
    cursor: pointer;
  }
`

const Wallet: React.FC = () => {
  const [connected, setIsConnected] = useState(walletApi.isConnected())

  const connectWallet = async (): Promise<void> => {
    try {
      console.log('[Wallet] Connect')
      await walletApi.connect()
      setIsConnected(true)
    } catch (error) {
      console.log('Login error', error)
    }
  }

  return connected ? <span>Connected!</span> : <Wrapper onClick={connectWallet}>Connect to Wallet</Wrapper>
}

export default Wallet

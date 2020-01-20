import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWallet } from '@fortawesome/free-solid-svg-icons'

import { useWalletConnection } from 'hooks/useWalletConnection'
import { Redirect } from 'react-router'
import { History } from 'history'
import styled from 'styled-components'

type ConnectWalletProps = History<{ from: string }>
const Wrapper = styled.div`
  text-align: center;
  p {
    padding: 0.85em;
    color: var(--color-text-secondary);
  }
`

const IconWallet = styled(FontAwesomeIcon)`
  color: #a882d8;
`

const ConnectWallet: React.FC<ConnectWalletProps> = (props: ConnectWalletProps) => {
  const { from } = props.location.state || { from: { pathname: '/' } }
  const { isConnected, pending } = useWalletConnection()

  if (pending) return null

  if (isConnected) {
    return <Redirect to={from} />
  }

  return (
    <Wrapper className="widget">
      <IconWallet icon={faWallet} size="6x" />
      <h1>Wallet Disconnected</h1>
      <p>Please connect your wallet using the button at the top of the page 👆</p>
    </Wrapper>
  )
}

export default ConnectWallet

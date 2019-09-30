import React from 'react'
import styled from 'styled-components'

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
function connectWallet(): void {
  alert('TODO: Connect to Wallet')
}

const Wallet: React.FC = () => (
  <Wrapper className="connect-wallet" onClick={connectWallet}>
    Connect to Wallet
  </Wrapper>
)

export default Wallet

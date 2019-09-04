import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.header`
  color: #FFFFFF;
  background-color: var(--color-header-bg);
  min-height: var(--header-height);  
  font-size: 1.5am;
  //position: relative;

  nav {
    display: flex;
  }

  ul.menu {
    flex: 1;
  }

  .logo,.connect-wallet {
    padding: 1rem;
    margin: 1rem;
    border: 2px solid var(--color-btn-border);
    color: var(--color-btn-border);
    vertical-align: middle;

    &:hover {
      color: white;
      border-color: white;
      cursor: pointer;
    }
  }

  .logo {
    font-size: 1.2em;
  }
`

function connectWallet () {
  alert("TODO: Connect to Wallet")
}

const Header: React.FC = () => (
    <Wrapper>
      <nav>
        <a className="logo">
          dFusion PoC
        </a>
        <ul className="menu">
          <li>Page A</li>
          <li>Page B</li>
        </ul>
        <a className="connect-wallet" onClick={connectWallet}>
          Connect to Wallet
        </a>
      </nav>
      <h1>Swap stable coins</h1>
      <h2>Fair, efficient prices, Onchain</h2>
    </Wrapper>
)

export default Header
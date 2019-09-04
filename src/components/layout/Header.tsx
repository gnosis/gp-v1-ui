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
    align-items: center;
  }

  .nav-links {
    flex: 1;
    display: flex;
    justify-content: flex-end;

    list-style-type: none;
    margin-right: 3rem;
    white-space: nowrap;

    a {
      padding: 1em;
    }
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

  .header-title {
    width: 30rem;
    margin: 0 auto;
  }

  h1 {
    margin-bottom: 0;
  }
  h2 {
    font-size: 1.6rem;
    margin-top: 0;
    color: #ffbae9;
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
        <ul className="nav-links">
          <li><a href="#">Page A</a></li>
          <li><a href="#">Page B</a></li>
        </ul>
        <a className="connect-wallet" onClick={connectWallet}>
          Connect to Wallet
        </a>
      </nav>
      <div class="header-title">
        <h1>Swap stable coins</h1>
        <h2>Fair, Efficient prices, Onchain</h2>
      </div>
    </Wrapper>
)

export default Header
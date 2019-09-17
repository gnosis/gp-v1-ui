import React from 'react'
import styled from 'styled-components'
import { rem } from 'polished'
import { Link } from 'react-router-dom'

const Wrapper = styled.header`
  color: #ffffff;
  background-color: #3340a9;
  min-height: ${rem('325px')};
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
      color: white;
      padding: 0.8em;
    }
  }

  .logo,
  .connect-wallet {
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
  }

  .logo {
    font-size: 1.2em;
  }

  .header-title {
    width: 30rem;
    margin: 0 auto;
    line-height: 1.15;
  }

  h1 {
    margin-bottom: 0;
  }
  h2 {
    font-size: 1.6rem;
    margin-top: 0;
    color: #e0aacf;
  }
`

function connectWallet(): void {
  alert('TODO: Connect to Wallet')
}

const Header: React.FC = () => (
  <Wrapper>
    <nav>
      <Link className="logo" to="/">
        dFusion PoC
      </Link>
      <ul className="nav-links">
        <li>
          <Link to="/">Trade</Link>
        </li>
        <li>
          <Link to="/deposit">Deposit</Link>
        </li>
      </ul>
      <a className="connect-wallet" onClick={connectWallet}>
        Connect to Wallet
      </a>
    </nav>
    <div className="header-title">
      <h1>Swap stable coins</h1>
      <h2>Fair, Efficient prices, Onchain</h2>
    </div>
  </Wrapper>
)

export default Header

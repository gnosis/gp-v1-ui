import React from 'react'
import styled from 'styled-components'
import { rem } from 'polished'
import { Link } from 'react-router-dom'
import Wallet from 'components/Wallet'

const Wrapper = styled.header`
  color: #ffffff;
  background-color: #3340a9;
  min-height: ${rem('325px')};
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

  .logo {
    padding: 1rem;
    margin: 1rem;
    border: 2px solid #ff5097;
    color: #ff5097;
    vertical-align: middle;
    font-size: 1.2em;

    &:hover {
      color: white;
      border-color: white;
      cursor: pointer;
    }
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

  ${Wallet} {
    &:hover {
      color: white;
      border-color: white;
      cursor: pointer;
      background-color: inherit;
    }
  }
`

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
      <Wallet />
    </nav>
    <div className="header-title">
      <h1>Swap stable coins</h1>
      <h2>Fair, Efficient prices, Onchain</h2>
    </div>
  </Wrapper>
)

export default Header

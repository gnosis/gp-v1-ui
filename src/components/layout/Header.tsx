import React from 'react'
import styled from 'styled-components'
import { rem } from 'polished'
import { Link } from 'react-router-dom'
import Wallet from 'components/Wallet'

const Wrapper = styled.header`
  color: #ffffff;
  background-color: #3340a9;
  min-height: ${rem('325px')};

  nav {
    display: flex;
    align-items: center;
    flex-flow: row wrap;

    @media (max-width: 768px) {
      justify-content: center;
    }
  }

  .nav-links {
    display: flex;
    flex: 1;
    justify-content: center;
    padding: 0;
    list-style-type: none;
    white-space: nowrap;

    a {
      color: white;
      padding: 0.8em;
    }

    @media (max-width: 768px) {
      flex: 1 1 100%;
      order: 3;
    }
  }

  .logo {
    flex: 0 1 16rem;
    border: 2px solid #ff5097;
    color: #ff5097;
    text-align: center;
    vertical-align: middle;

    &:hover {
      color: white;
      border-color: white;
      cursor: pointer;
    }
  }

  .nav-links,
  .logo {
    padding: 1rem;
    margin: 1rem;
  }

  .header-title {
    margin: 0 auto;
    line-height: 1.15;
    text-align: center;
    width: 95%;
  }

  h1 {
    margin-bottom: 0;
  }
  h3 {
    // font-size: 1.6rem;
    margin-top: 0;
    color: #e0aacf;
  }
  }

  @media (max-width: 768px) {
    .logo,
    .nav-links {
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
      <h3>Fair, Efficient prices, Onchain</h3>
    </div>
  </Wrapper>
)

export default Header

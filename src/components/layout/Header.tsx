import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { Switch, Route } from 'react-router'
import { rem } from 'polished'

import Wallet, { WalletWrapper } from 'components/Wallet'
import LinkWithPastLocation from 'components/LinkWithPastLocation'

const Wrapper = styled.header`
  color: #ffffff;
  background-color: #3340a9;
  min-height: ${rem('325px')};

  nav {
    display: flex;
    align-items: center;
    flex-flow: row wrap;

    @media only screen and (max-width: 866px) {
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

    @media only screen and (max-width: 866px) {
      flex: 1 1 100%;
      order: 2;
    }
  }

  .logo {
    flex: 0 1 16rem;
    color: #ff62a2;
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
    padding: 0.5rem;
    margin: 0.5rem;
  }

  .header-title {
    margin: 0 auto;
    line-height: 1.15;
    text-align: center;
    width: 95%;

    h1 {
      margin: 0;
    }
  }

  h1 {
    margin-bottom: 0;
    color: #e0e1e2;
    font-size: 3em;

    em {
      font-size: 1.2em;
      color: #ff62a2;
    }
  }
  h2 {
    margin-top: 1em;
    text-transform: uppercase;
    color: white;
    font-size: 0.8em;
  }

  @media only screen and (max-width: 500px) {
    .logo,
    .nav-links,
    ${WalletWrapper} {
      padding: 0.25rem;
    }

    .nav-links {
      margin: 0 auto;
    }

    ${WalletWrapper} {
      font-size: 80%;
      order: 3;
      &::last-child {
        border-top: 0.7px solid #00000029 !important;
      }
    }

    .header-title {
      margin-bottom: 2rem;
      h1 {
        font-size: 1.8rem;
      }
      h3 {
        font-size: 1rem;
      }
    }
  }
`

const Header: React.FC = () => {
  // const location = useLocation()

  // TODO: Why???
  // const { from } = location.state || { from: { pathname: '/' } }

  return (
    <Wrapper>
      <nav>
        <Link className="logo" to="/">
          fuse
        </Link>
        <ul className="nav-links">
          <li>
            <Link to="/trade">Trade</Link>
          </li>
          <li>
            {/* TODO: Not impleented yet. Comment out after reviewing this PR */}
            <Link to="/strategies">Strategies</Link>
          </li>
          <li>
            <LinkWithPastLocation to="/wallet">Wallet</LinkWithPastLocation>
          </li>
          <li>
            {/* TODO: Not impleented yet. Comment out after reviewing this PR */}
            <Link to="/orders">Orders</Link>
          </li>
          <li>
            <LinkWithPastLocation to="/orders">Orders</LinkWithPastLocation>
          </li>
        </ul>
        <Wallet />
      </nav>
      <div className="header-title">
        <h1>
          <em>𝚏</em>𝓊𝗌𝓮
        </h1>

        <Switch>
          <Route path="/trade">
            <h2>Trading</h2>
          </Route>
          <Route path="/strategies">
            <h2>Set up standing orders</h2>
          </Route>
          <Route path="/wallet">
            <h2>Your funds, Deposit, Withdraw</h2>
          </Route>
          <Route path="/orders">
            <h2>Your orders</h2>
          </Route>
          <Route path="/connect-wallet">
            <h2>Connect wallet</h2>
          </Route>
        </Switch>
      </div>
    </Wrapper>
  )
}

export default Header

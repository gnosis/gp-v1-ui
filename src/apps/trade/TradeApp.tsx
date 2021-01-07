import React from 'react'
import styled from 'styled-components'
import { BrowserRouter, HashRouter, Route, Switch, Link } from 'react-router-dom'
import { hot } from 'react-hot-loader/root'

import { MEDIA } from 'const'

import { withGlobalContext } from 'hooks/useGlobalState'
import useNetworkCheck from 'hooks/useNetworkCheck'
import Console from 'Console'
import { GlobalModalInstance } from 'components/OuterModal'
import { rootReducer, INITIAL_STATE } from 'reducers-actions'

import { GenericLayout } from 'components/layout'
import { Menu } from 'components/layout/GenericLayout/Menu'
import { NavTools } from 'components/layout/GenericLayout/NavTools'

import PortfolioImage from 'assets/img/portfolio.svg'
import PortfolioImageWhite from 'assets/img/portfolio-white.svg'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Router: typeof BrowserRouter & typeof HashRouter = (window as any).IS_IPFS ? HashRouter : BrowserRouter

const NotFound = React.lazy(
  () =>
    import(
      /* webpackChunkName: "Extra_routes_chunk"*/
      './pages/NotFound'
    ),
)

const Trading = React.lazy(
  () =>
    import(
      /* webpackChunkName: "Trade_chunk"*/
      './pages/Trading'
    ),
)

const PortfolioLink = styled.li`
  margin: 0 2.4rem 0 0;

  @media ${MEDIA.mediumDown} {
    order: 2;
  }

  > a::before {
    display: block;
    margin: 0 0.8rem 0 0;
    width: 1.6rem;
    height: 1.4rem;
    content: '';
    background: url(${PortfolioImage}) no-repeat center/contain;
  }

  &:hover > a::before {
    background-image: url(${PortfolioImageWhite});
  }
`

export const SwapAppV1: React.FC = () => {
  // Deal with incorrect network
  useNetworkCheck()

  const menu = (
    <Menu>
      <li>
        <Link to="/">Trade</Link>
      </li>
      <li>
        <Link to="/swap">Swap</Link>
      </li>
      <li>
        <Link to="/liquidity">Liquidity</Link>
      </li>
    </Menu>
  )

  const navTools = (
    <NavTools hasWallet hasNotifications hasSettings>
      <PortfolioLink>
        <Link to="/portfolio">Portfolio</Link>
      </PortfolioLink>
    </NavTools>
  )

  return (
    <>
      <Router basename={process.env.BASE_URL}>
        <GenericLayout menu={menu} navTools={navTools}>
          <React.Suspense fallback={null}>
            <Switch>
              <Route path="/" exact component={Trading} />
              <Route component={NotFound} />
            </Switch>
          </React.Suspense>
        </GenericLayout>
        {GlobalModalInstance}
      </Router>
      {process.env.NODE_ENV === 'development' && <Console />}
    </>
  )
}

export default hot(
  withGlobalContext(
    SwapAppV1,
    // Initial State
    INITIAL_STATE,
    rootReducer,
  ),
)

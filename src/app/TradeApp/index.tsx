import React from 'react'
import { Switch, Route, Link } from 'react-router-dom'
import styled from 'styled-components'

import { MEDIA } from 'const'

import { GenericLayout } from 'components/layout'
import { Menu } from 'components/layout/GenericLayout/Menu'
import { NavTools } from 'components/layout/GenericLayout/NavTools'

import PortfolioImage from 'assets/img/portfolio.svg'
import PortfolioImageWhite from 'assets/img/portfolio-white.svg'

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
    background: url(${PortfolioImageWhite}) no-repeat center/contain;
  }
`

export const TradeApp: React.FC = () => {
  const menu = (
    <Menu>
      <li>
        <Link to="/v2">Trade</Link>
      </li>
      <li>
        <Link to="/v2/swap">Swap</Link>
      </li>
      <li>
        <Link to="/v2/liquidity">Liquidity</Link>
      </li>
    </Menu>
  )

  const navTools = (
    <NavTools hasWallet hasNotifications hasSettings>
      <PortfolioLink>
        <Link to="/v2/portfolio">Portfolio</Link>
      </PortfolioLink>
    </NavTools>
  )

  return (
    <GenericLayout menu={menu} navTools={navTools}>
      <React.Suspense fallback={null}>
        <Switch>
          <Route path="/v2" exact component={Trading} />
          <Route component={NotFound} />
        </Switch>
      </React.Suspense>
    </GenericLayout>
  )
}

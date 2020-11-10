import React from 'react'
import { Route, Switch } from 'react-router-dom'

import { GenericLayout } from 'components/layout'
import { Menu } from 'components/layout/GenericLayout/Menu'
import { Frame } from 'components/common/Frame'

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

const NavTools: React.FC = () => (
  <Frame>
    <footer>Tools</footer>
  </Frame>
)

export const TradeApp: React.FC = () => {
  const menu = (
    <Menu>
      <li>
        <a href="#">Trade</a>
      </li>
      <li>
        <a href="#">Swap</a>
      </li>
      <li>
        <a href="#">Liquidity</a>
      </li>
    </Menu>
  )

  const navTools = <NavTools />

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

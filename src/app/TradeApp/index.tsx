import React from 'react'
import { Route, Switch } from 'react-router-dom'

import { GenericLayout } from 'components/layout'
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

const Menu: React.FC = () => (
  <Frame>
    <footer>Menu</footer>
  </Frame>
)

const NavTools: React.FC = () => (
  <Frame>
    <footer>Tools</footer>
  </Frame>
)

export const TradeApp: React.FC = () => (
  <GenericLayout menu={<Menu />} navTools={<NavTools />}>
    <React.Suspense fallback={null}>
      <Switch>
        <Route path="/v2" exact component={Trading} />
        <Route component={NotFound} />
      </Switch>
    </React.Suspense>
  </GenericLayout>
)

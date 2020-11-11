import React from 'react'
import { Route, Switch } from 'react-router-dom'

import { GenericLayout } from 'components/layout'

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

export const TradeApp: React.FC = () => (
  <GenericLayout>
    <React.Suspense fallback={null}>
      <Switch>
        <Route path="/v2" exact component={Trading} />
        <Route component={NotFound} />
      </Switch>
    </React.Suspense>
  </GenericLayout>
)

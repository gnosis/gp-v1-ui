import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import PrivateRoute from 'PrivateRoute'
import GlobalStyles from 'styles/global'
import { ToastContainer } from 'setupToastify'

import { encodeSymbol } from '@gnosis.pm/dex-js'
import { assertNonNull } from 'utils'

import { LegacyTradeLayout } from 'components/layout'

// Pages
const About = React.lazy(
  () =>
    import(
      /* webpackChunkName: "Extra_routes_chunk"*/
      './pages/About'
    ),
)

const Trade = React.lazy(
  () =>
    import(
      /* webpackChunkName: "Trade_chunk"*/
      './pages/Trade'
    ),
)

const Trades = React.lazy(
  () =>
    import(
      /* webpackChunkName: "Trade_chunk"*/
      './pages/Trades'
    ),
)

const Strategies = React.lazy(
  () =>
    import(
      /* webpackChunkName: "Strategies_chunk"*/
      './pages/Strategies'
    ),
)

const Orders = React.lazy(
  () =>
    import(
      /* webpackChunkName: "Orders_chunk"*/
      './pages/Orders'
    ),
)

const Wallet = React.lazy(
  () =>
    import(
      /* webpackChunkName: "Wallet_chunk"*/
      './pages/Wallet'
    ),
)

const NotFound = React.lazy(
  () =>
    import(
      /* webpackChunkName: "Extra_routes_chunk"*/
      './pages/NotFound'
    ),
)

const ConnectWallet = React.lazy(
  () =>
    import(
      /* webpackChunkName: "Extra_routes_chunk"*/
      './pages/ConnectWallet'
    ),
)
const FAQ = React.lazy(
  () =>
    import(
      /* webpackChunkName: "Extra_routes_chunk"*/
      './pages/FAQ'
    ),
)
const OrderBook = React.lazy(
  () =>
    import(
      /* webpackChunkName: "OrderBook_chunk"*/
      './pages/OrderBook'
    ),
)
const Settings = React.lazy(
  () =>
    import(
      /* webpackChunkName: "Settings_chunk"*/
      './pages/Settings'
    ),
)

function getInitialUrl(): string {
  assertNonNull(CONFIG.initialTokenSelection, 'initialTokenSelection config is required')
  const { sellToken: initialSellToken, receiveToken: initialReceiveToken } = CONFIG.initialTokenSelection
  assertNonNull(initialSellToken, 'sellToken is required in the initialTokenSelection config')
  assertNonNull(initialReceiveToken, 'receiveToken is required in the initialTokenSelection config')
  return '/trade/' + encodeSymbol(initialReceiveToken) + '-' + encodeSymbol(initialSellToken) + '?sell=0&price=0'
}

const initialUrl = getInitialUrl()

export const LegacyTradeApp: React.FC = () => (
  <LegacyTradeLayout>
    <GlobalStyles />
    <ToastContainer />
    <React.Suspense fallback={null}>
      <Switch>
        <PrivateRoute path="/orders" exact component={Orders} />
        <Route path="/trade/:buy-:sell" component={Trade} />
        <PrivateRoute path="/liquidity" exact component={Strategies} />
        <PrivateRoute path="/wallet" exact component={Wallet} />
        <Route path="/about" exact component={About} />
        <Route path="/faq" exact component={FAQ} />
        <Route path="/book" exact component={OrderBook} />
        <Route path="/connect-wallet" exact component={ConnectWallet} />
        <Route path="/trades" exact component={Trades} />
        <Route path="/settings" exact component={Settings} />
        <Redirect from="/" to={initialUrl} />
        <Route component={NotFound} />
      </Switch>
    </React.Suspense>
  </LegacyTradeLayout>
)

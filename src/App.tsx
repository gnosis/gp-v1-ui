import 'types'

import { hot } from 'react-hot-loader/root'
import React from 'react'
import { BrowserRouter, HashRouter, Route, Switch, Redirect } from 'react-router-dom'
import Console from './Console'
import { encodeSymbol } from '@gnosis.pm/dex-js'

// SCSS
import GlobalStyles from 'styles/global'

// Main layout
import { SwapLayout } from 'components/layout'

// Pages
const About = React.lazy(() =>
  import(
    /* webpackChunkName: "Extra_routes_chunk"*/
    'pages/About'
  ),
)

const Trade = React.lazy(() =>
  import(
    /* webpackChunkName: "Trade_chunk"*/
    'pages/Trade'
  ),
)

const Trades = React.lazy(() =>
  import(
    /* webpackChunkName: "Trade_chunk"*/
    'pages/Trades'
  ),
)

const Strategies = React.lazy(() =>
  import(
    /* webpackChunkName: "Strategies_chunk"*/
    'pages/Strategies'
  ),
)

const Orders = React.lazy(() =>
  import(
    /* webpackChunkName: "Orders_chunk"*/
    'pages/Orders'
  ),
)

const Wallet = React.lazy(() =>
  import(
    /* webpackChunkName: "Wallet_chunk"*/
    'pages/Wallet'
  ),
)

const NotFound = React.lazy(() =>
  import(
    /* webpackChunkName: "Extra_routes_chunk"*/
    'pages/NotFound'
  ),
)
const ConnectWallet = React.lazy(() =>
  import(
    /* webpackChunkName: "Extra_routes_chunk"*/
    'pages/ConnectWallet'
  ),
)
const FAQ = React.lazy(() =>
  import(
    /* webpackChunkName: "Extra_routes_chunk"*/
    'pages/FAQ'
  ),
)
const OrderBook = React.lazy(() =>
  import(
    /* webpackChunkName: "OrderBook_chunk"*/
    'pages/OrderBook'
  ),
)
const Settings = React.lazy(() =>
  import(
    /* webpackChunkName: "Settings_chunk"*/
    'pages/Settings'
  ),
)

// Global State
import { withGlobalContext } from 'hooks/useGlobalState'
import { rootReducer, INITIAL_STATE } from 'reducers-actions'
import PrivateRoute from './PrivateRoute'
import { assertNonNull } from 'utils'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Router: typeof BrowserRouter & typeof HashRouter = (window as any).IS_IPFS ? HashRouter : BrowserRouter

function getInitialUrl(): string {
  assertNonNull(CONFIG.initialTokenSelection, 'initialTokenSelection config is required')
  const { sellToken: initialSellToken, receiveToken: initialReceiveToken } = CONFIG.initialTokenSelection
  assertNonNull(initialSellToken, 'sellToken is required in the initialTokenSelection config')
  assertNonNull(initialReceiveToken, 'receiveToken is required in the initialTokenSelection config')
  return '/trade/' + encodeSymbol(initialSellToken) + '-' + encodeSymbol(initialReceiveToken) + '?sell=0&price=0'
}

const initialUrl = getInitialUrl()

// App
const App: React.FC = () => (
  <>
    <GlobalStyles />
    <Router basename={process.env.BASE_URL}>
      <SwapLayout>
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
      </SwapLayout>
    </Router>
    {process.env.NODE_ENV === 'development' && <Console />}
  </>
)

export default hot(
  withGlobalContext(
    App,
    // Initial State
    INITIAL_STATE,
    rootReducer,
  ),
)

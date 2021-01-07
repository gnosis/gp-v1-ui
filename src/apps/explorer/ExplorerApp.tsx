import React from 'react'
import { BrowserRouter, HashRouter, Route, Switch, Link } from 'react-router-dom'
import { hot } from 'react-hot-loader/root'

import { withGlobalContext } from 'hooks/useGlobalState'
import useNetworkCheck from 'hooks/useNetworkCheck'
import Console from 'Console'
import { GlobalModalInstance } from 'components/OuterModal'
import { rootReducer, INITIAL_STATE } from 'reducers-actions'

import { GenericLayout } from 'components/layout'
import { Menu } from 'components/layout/GenericLayout/Menu'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Router: typeof BrowserRouter & typeof HashRouter = (window as any).IS_IPFS ? HashRouter : BrowserRouter

const NotFound = React.lazy(
  () =>
    import(
      /* webpackChunkName: "Extra_routes_chunk"*/
      './pages/NotFound'
    ),
)

const Home = React.lazy(
  () =>
    import(
      /* webpackChunkName: "Trade_chunk"*/
      './pages/Home'
    ),
)

export const SwapAppV1: React.FC = () => {
  // Deal with incorrect network
  useNetworkCheck()

  const menu = (
    <Menu>
      <li>
        <Link to="/">Batches</Link>
      </li>
      <li>
        <Link to="/trades">Trades</Link>
      </li>
      <li>
        <Link to="/markets">Markets</Link>
      </li>
    </Menu>
  )

  return (
    <>
      <Router basename={process.env.BASE_URL}>
        <GenericLayout menu={menu}>
          <React.Suspense fallback={null}>
            <Switch>
              <Route path="/" exact component={Home} />
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

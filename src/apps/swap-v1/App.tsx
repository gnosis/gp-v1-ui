import 'types'

import { hot } from 'react-hot-loader/root'
import React from 'react'
import { BrowserRouter, HashRouter, Route, Switch } from 'react-router-dom'
import Console from '../../Console'

import useNetworkCheck from 'hooks/useNetworkCheck'

import { GlobalModalInstance } from 'components/OuterModal'

// Global State
import { withGlobalContext } from 'hooks/useGlobalState'
import { rootReducer, INITIAL_STATE } from 'reducers-actions'
import { TradeApp } from 'app/TradeApp'
import { LegacyTradeApp } from 'app/LegacyTradeApp'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Router: typeof BrowserRouter & typeof HashRouter = (window as any).IS_IPFS ? HashRouter : BrowserRouter

// App
const App: React.FC = () => {
  // Deal with incorrect network
  useNetworkCheck()

  return (
    <>
      <Router basename={process.env.BASE_URL}>
        <Switch>
          <Route path="/v2">
            <TradeApp />
          </Route>
          <Route>
            <LegacyTradeApp />
          </Route>
        </Switch>
        {GlobalModalInstance}
      </Router>
      {process.env.NODE_ENV === 'development' && <Console />}
    </>
  )
}

export default hot(
  withGlobalContext(
    App,
    // Initial State
    INITIAL_STATE,
    rootReducer,
  ),
)

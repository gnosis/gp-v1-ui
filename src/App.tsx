import 'types'

import React from 'react'
import { hot } from 'react-hot-loader/root'
import { BrowserRouter as Router, Route, Switch, RouteProps, Redirect } from 'react-router-dom'

// SCSS
import GlobalStyles from './components/layout/GlobalStyles'

// Toast notifications
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.min.css'

// Main layout
import Layout from 'components/layout/'

// Pages
import About from 'pages/About'
import Deposit from 'pages/Deposit'
import Trade from 'pages/Trade'
import SourceCode from 'pages/SourceCode'
import NotFound from 'pages/NotFound'
import ConnectWallet from 'pages/ConnectWallet'
import { walletApi } from 'api'

// Global State
import { withGlobalContext } from 'hooks/useGlobalState'
import { rootReducer, TokenRowInitialState as TokenRow } from 'reducers-actions'

const PrivateRoute: React.FC<RouteProps> = (props: RouteProps) => {
  const isConnected = walletApi.isConnected()

  const { component: Component, ...rest } = props
  return (
    <Route
      {...rest}
      render={(props): React.ReactNode =>
        isConnected && Component ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: '/connect-wallet',
              state: { from: props.location },
            }}
          />
        )
      }
    />
  )
}

toast.configure({ position: toast.POSITION.BOTTOM_RIGHT, closeOnClick: false })

// App
const App: React.FC = () => (
  <>
    <GlobalStyles />
    <Router basename={process.env.BASE_URL}>
      <Layout>
        <Switch>
          <Route path="/trade/:sell-:buy" component={Trade} />
          <Route path="/about" exact component={About} />
          <PrivateRoute path="/deposit" exact component={Deposit} />
          <Route path="/source-code" exact component={SourceCode} />
          <Route path="/connect-wallet" exact component={ConnectWallet} />
          <Redirect from="/" to="/trade/DAI-USDC?sell=0&buy=0" />
          <Route component={NotFound} />
        </Switch>
      </Layout>
    </Router>
  </>
)

export default hot(
  withGlobalContext(
    App,
    // Initial State
    () => {
      // Make sure key names here match that of src/reducers-actions/combineReducers keys
      // These key names are the state slices accessible from the useGlobalState hook via
      // const [{ TokenRow }, dispatch] = useGlobalState()
      return {
        TokenRow,
      }
    },
    rootReducer,
  ),
)

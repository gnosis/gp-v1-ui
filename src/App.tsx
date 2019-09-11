import 'types'

import * as React from 'react'
import { hot } from 'react-hot-loader/root'
import GlobalStyles from './components/layout/GlobalStyles'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

// Main layout
import Layout from 'components/layout/'

// Pages
import About from 'pages/About'
import Deposit from 'pages/Deposit'
import Trade from 'pages/Trade'
import SourceCode from 'pages/SourceCode'
import NotFound from 'pages/NotFound'

// App
const App: React.FC = () => (
  <>
    <GlobalStyles />
    <Router basename={process.env.BASE_URL}>
      <Layout>
        <Switch>
          <Route path="/" exact component={Trade} />
          <Route path="/about" exact component={About} />
          <Route path="/deposit" exact component={Deposit} />
          <Route path="/source-code" exact component={SourceCode} />
          <Route component={NotFound} />
        </Switch>
      </Layout>
    </Router>
  </>
)

export default hot(App)

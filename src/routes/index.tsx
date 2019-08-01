import React from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'

import Auctions from 'components/Test_Auctions'
import SellOrders from 'components/Test_SellOrders'

const Hello: React.FC = () => <h1>Hello World!</h1>

const AppRouter: React.FC = () => (
    <Router basename={process.env.BASE_URL}>
        <Route path="/" exact component={Hello} />
        <Route path="/auctions" exact component={Auctions} />
        <Route path="/sell-orders" exact component={SellOrders} />
    </Router>
)

export default AppRouter

import React from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'

const Hello: React.FC = () => <h1>Hello World!</h1>

const AppRouter: React.FC = () => (
    <Router basename={process.env.BASE_URL}>
        <Route path="/" exact component={Hello} />
    </Router>
)

export default AppRouter

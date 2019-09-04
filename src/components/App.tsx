import React from 'react'
import { hot } from 'react-hot-loader/root'
import GlobalStyles from './layout/GlobalStyles'

import AppRoutes from 'routes/'

const App: React.FC = () => (
    <>
        <GlobalStyles />
        <AppRoutes />
    </>
)

export default hot(App)

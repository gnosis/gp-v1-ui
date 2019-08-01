import React from 'react'
import { hot } from 'react-hot-loader/root'
import { Global } from 'styles'

import AppRoutes from 'routes/'

const App: React.FC = () => (
    // <Providers>
    <>
        <Global />
        <AppRoutes />
    </>
    // </Providers>
)

export default hot(App)

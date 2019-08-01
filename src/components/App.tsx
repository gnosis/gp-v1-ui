import React from 'react'
import { hot } from 'react-hot-loader/root'
import { Global } from 'styles'

import { ApolloProvider } from 'react-apollo';

import AppRoutes from 'routes/'

import { client } from 'data/apollo'

const App: React.FC = () => (
    <ApolloProvider client={client}>
        <>
            <Global />
            <AppRoutes />
        </>
    </ApolloProvider>
)

export default hot(App)

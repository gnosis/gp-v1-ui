import { split } from 'apollo-link'
import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { WebSocketLink } from 'apollo-link-ws'
import { createHttpLink } from 'apollo-link-http'
import { getMainDefinition } from 'apollo-utilities'

import { HTTP_GRAPHQL_URI, WSS_GRAPHQL_URI } from '../../globals'

const wssLink = new WebSocketLink({
    uri: WSS_GRAPHQL_URI,
    options: { reconnect: true }
})
const httpLink = createHttpLink({ uri: HTTP_GRAPHQL_URI })

// const link = concat(httpLink, wssLink)
const link = split(
    // split based on operation type
    ({ query }) => {
        const { kind, operation } = getMainDefinition(query)
        return kind === 'OperationDefinition' && operation === 'subscription'
    },
    wssLink,
    httpLink,
)

export const client = new ApolloClient({
    link,
    cache: new InMemoryCache()
})

export default client

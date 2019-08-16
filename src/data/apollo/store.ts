import { split } from 'apollo-link'
import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { WebSocketLink } from 'apollo-link-ws'
import { createHttpLink } from 'apollo-link-http'
import { getMainDefinition } from 'apollo-utilities'

import resolvers, { defaultState } from './resolvers'
import typeDefs from './typeDefs'

import { HTTP_GRAPHQL_URI, WSS_GRAPHQL_URI } from 'globals'

const wssLink = new WebSocketLink({
    uri: WSS_GRAPHQL_URI,
    options: { reconnect: true },
})
const httpLink = createHttpLink({ uri: HTTP_GRAPHQL_URI })

const link = split(
    // split based on operation type
    ({ query }) => {
        const { kind, operation } = getMainDefinition(query)
        return kind === 'OperationDefinition' && operation === 'subscription'
    },
    wssLink,
    httpLink,
)

const cache = new InMemoryCache()
export const client = new ApolloClient({
    cache,
    link,
    resolvers,
    typeDefs,
})

cache.writeData({ data: defaultState })
client.onResetStore((): any => cache.writeData({ data: defaultState }))

export default client

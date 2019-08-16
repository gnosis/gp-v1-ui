import { ApolloCache } from 'apollo-cache'
import gql from 'graphql-tag'

// TODO: remove
async function getAccount(): Promise<string> {
    return '0x123123123123123'
}
// TODO: remove
async function getBalance(address: string): Promise<string> {
    return address ? 'address passed: 0.5' : 'address NOT passed: 0.7'
}
// TODO: remove
async function getNetworkID(): Promise<number> {
    return 1
}

// TODO: remove
export const GET_WEB3_ACCOUNT = gql`
    {
        web3 @client {
            accounts
        }
    }
`

export const GET_WEB3_BALANCE = gql`
    {
        web3 @client {
            balance
        }
    }
`

export const GET_WEB3_DATA = gql`
    {
        web3 @client {
            accounts
            balance
            network
        }
    }
`

export interface Web3State {
    account: string
    balance: string
    network: number | string
}

const userResolvers = {
    Web3: {
        account: async (): Promise<string> => getAccount(),
        balance: async (
            _: null,
            { address }: { address: string },
            { cache }: { cache: ApolloCache<Web3State> },
        ): Promise<string> => {
            if (!address) {
                address = cache.readQuery(GET_WEB3_ACCOUNT)
                console.log('TCL: address', address)
            }
            return getBalance(address)
        },
        network: async (): Promise<number> => getNetworkID(),
    },
}

export const defaults: Web3State = {
    account: 'Unknown',
    balance: undefined,
    network: undefined,
}

export default userResolvers

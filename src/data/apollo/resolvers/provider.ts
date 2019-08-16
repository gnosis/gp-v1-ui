export interface ProviderState {
    name: string
    __typename: string
}

const providerResolvers = {
    Provider: {
        provider: (): ProviderState => ({ __typename: 'Provider', name }),
    },
}

export const defaults: ProviderState = {
    __typename: 'Provider',
    name: 'Unknown',
}
export default providerResolvers

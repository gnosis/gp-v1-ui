import React from 'react'

import { Query } from 'react-apollo'
import { gql } from 'apollo-boost'

const Auctions: React.FC = () => 
    <Query 
        query={gql`
            {
                auctions(first: 50) {
                    id
                    sellToken
                    buyToken
                    auctionIndex
                    startTime
                }
            }
        `}
    >
        {({ loading, error, data }: any) => {
            if (loading) return <h2>LOADING...</h2>
            if (error) return <pre style={{ padding: 20 }}>ERROR! {JSON.stringify(error, null, 2)}</pre>

            return data.auctions.map((data: any) => <pre>{Object.keys(data).map(item => <p>{`${item}: ${data[item]}`}</p>)}</pre>)
        }}
    </Query>

export default Auctions

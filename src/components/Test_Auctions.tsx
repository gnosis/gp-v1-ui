import React from 'react'

import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

const Auctions: React.FC = () => {
    const { loading, error, data } = useQuery(gql`
        {
            auctions(first: 50) {
                id
                sellToken
                buyToken
                auctionIndex
                startTime
            }
        }
    `)

    if (loading) return <h2>LOADING...</h2>
    if (error) return <pre style={{ padding: 20 }}>ERROR! {JSON.stringify(error, null, 2)}</pre>

    return data.auctions.map((data: any) => (
        <pre key={data.id}>
            {Object.keys(data).map(item => (
                <p key={data.id}>{`${item}: ${data[item]}`}</p>
            ))}
        </pre>
    ))
}

export default Auctions

import React from 'react'
import { Subscription } from 'react-apollo'
import { gql } from 'apollo-boost'

const SELLORDER_SUBSCRIPTION = gql`
  subscription {
      sellOrders(first: 2, orderBy: timestamp, order: desc) {
          id
          amount
          timestamp
          transactionHash
      }
  }
`

const SellOrders = () => (
  <Subscription
    subscription={SELLORDER_SUBSCRIPTION}
  // variables={{ repoFullName }}
  >
    {({ data, loading }: any) => {
      if (loading) return <h1> LOADING! </h1>
      return (
        <>
          <h4>Sell Orders: </h4>
          <table>
            <tbody>
              <tr>
                <th>TX Hash</th>
                <th>Amount</th>
                <th>When</th>
              </tr>
              {!loading && data.sellOrders.map(({ amount, timestamp, transactionHash }: any) => (
                <tr key={transactionHash}>
                  <td>{transactionHash}</td>
                  <td>{amount / 10 ** 18}</td>
                  <td>{(new Date(timestamp * 1000)).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )
    }}
  </Subscription>
)

export default SellOrders

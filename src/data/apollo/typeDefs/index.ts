const typeDefs = `
  # Root resolver
  type Web3 {
    accounts: [String]
  }

  type Query {
    web3: Web3
  }

  type Transaction {
    txHash: String
    txState: TransactionMode
    createdAt: Int
    updatedAt: Int
  }

  schema {
    query: Query
    mutation: Mutation
  }
`

export default typeDefs

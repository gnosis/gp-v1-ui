import React from 'react'
import { TokenDetails } from '@gnosis.pm/dex-js'

import { BlueBoldText } from './DefineSpread.styled'
import { SpreadInformation } from './DefineSpread'
import { CreateStrategyWrapper } from './CreateStrategy.styled'
import AddFunding from './AddFunding'
import { Receipt } from 'types'

export interface CreateStrategyProps {
  selectedTokensMap: Map<number, TokenDetails>
  spread: number
  txIdentifier: string
  txReceipt?: Receipt
  txError?: Error
}

export const CreateStrategy: React.FC<CreateStrategyProps> = ({
  selectedTokensMap,
  spread,
  txIdentifier,
  txReceipt,
  txError,
}) => {
  const ordersCount = selectedTokensMap.size * (selectedTokensMap.size - 1)

  return (
    <CreateStrategyWrapper>
      {txIdentifier ? (
        <AddFunding txIdentifier={txIdentifier} txReceipt={txReceipt} />
      ) : txError ? (
        <div>ERROR! {txError}</div>
      ) : (
        <>
          <p>
            Once the transaction is sent and mined, <BlueBoldText as="span">{ordersCount} orders</BlueBoldText> will be
            created.
          </p>
        </>
      )}
      {txIdentifier ? '' : <SpreadInformation selectedTokensMap={selectedTokensMap} spread={spread} />}
    </CreateStrategyWrapper>
  )
}

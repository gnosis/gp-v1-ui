import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartArea } from '@fortawesome/free-solid-svg-icons'
import { TokenDetails } from '@gnosis.pm/dex-js'

import { BlueBoldText } from './DefineSpread.styled'
import { GreySubText } from './PoolingWidget.styled'
import { SpreadInformation } from './DefineSpread'
import { CreateStrategyWrapper, StrategyDetailsWrapper, UnderlinedText } from './CreateStrategy.styled'
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
            Once the transaction is sent and mined,{' '}
            <BlueBoldText $bold="none" as="span">
              {ordersCount} orders
        </BlueBoldText>{' '}
            will be created.
      </p>
        </>
      )}
      <SpreadInformation selectedTokensMap={selectedTokensMap} spread={spread} />
      <GreySubText>
        {txReceipt
          ? 'Your new liquidity has been successfully mined and submitted! Please carefully read the instructions above.'
          : 'Review your liquidity summary above and then send your transaction'}
      </GreySubText>
    </CreateStrategyWrapper>
  )
}

import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartArea } from '@fortawesome/free-solid-svg-icons'
import { TokenDetails } from '@gnosis.pm/dex-js'

import { RedBoldText } from './DefineSpread.styled'
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
      <h3>New liquidity details</h3>
      <StrategyDetailsWrapper>
        <FontAwesomeIcon icon={faChartArea} size="7x" color="orange" className="graph" />
        <SpreadInformation selectedTokensMap={selectedTokensMap} spread={spread} />
      </StrategyDetailsWrapper>
      {txIdentifier ? (
        <AddFunding txIdentifier={txIdentifier} txReceipt={txReceipt} />
      ) : txError ? (
        <div>ERROR! {txError}</div>
      ) : (
        <>
          <p>
            Once the transaction is sent and mined,{' '}
            <RedBoldText $bold="none" as="span">
              {ordersCount} orders
            </RedBoldText>{' '}
            will be created.
          </p>
          <p>
            These orders <UnderlinedText>can only be executed</UnderlinedText> with the deposited balance in the{' '}
            <strong>Exchange Wallet</strong>.
          </p>
          <p>
            Once the transaction is mined, please review the balance you have, and possibly deposit some tokens so these
            trades can be executed.
          </p>
        </>
      )}
    </CreateStrategyWrapper>
  )
}

import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartArea } from '@fortawesome/free-solid-svg-icons'
import { TokenDetails } from '@gnosis.pm/dex-js'

import { RedBoldText } from './DefineSpread.styled'
import { SpreadInformation } from './DefineSpread'
import { CreateStrategyWrapper, StrategyDetailsWrapper } from './CreateStrategy.styled'

export interface CreateStrategyProps {
  selectedTokensMap: Map<number, TokenDetails>
  spread: number
}

export const CreateStrategy: React.FC<CreateStrategyProps> = ({ selectedTokensMap, spread }) => {
  const ordersCount = selectedTokensMap.size * (selectedTokensMap.size - 1)

  return (
    <CreateStrategyWrapper>
      <h3>New strategy details</h3>
      <StrategyDetailsWrapper>
        <FontAwesomeIcon icon={faChartArea} size="7x" color="orange" className="graph" />
        <SpreadInformation selectedTokensMap={selectedTokensMap} spread={spread} />
      </StrategyDetailsWrapper>
      <p>
        Once the transaction is sent and mined,{' '}
        <RedBoldText $bold="none" as="span">
          {ordersCount} orders
        </RedBoldText>{' '}
        will be created.
      </p>
      <p>
        These orders <a href="">can only be executed</a> with the deposited balance in the{' '}
        <strong>Exchange Wallet</strong>.
      </p>
      <p>
        In the next step, you can review the balance you have, and possibly deposit some tokens so these trades can be
        executed.
      </p>
    </CreateStrategyWrapper>
  )
}

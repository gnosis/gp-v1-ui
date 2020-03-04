import React from 'react'
import { TokenDetails, DEFAULT_DECIMALS } from '@gnosis.pm/dex-js'

import { BlueBoldText, SpreadInformationWrapper } from './DefineSpread.styled'
import DefineSpread from './DefineSpread'
import { CreateStrategyWrapper } from './CreateStrategy.styled'
import AddFunding from './AddFunding'
import { Receipt } from 'types'

export interface CreateStrategyProps {
  isSubmitting: boolean
  selectedTokensMap: Map<number, TokenDetails>
  spread: number
  setSpread: (spread: number) => void
  txIdentifier: string
  txReceipt?: Receipt
  txError?: Error
}

interface SpreadInformationProps {
  selectedTokensMap: Map<number, TokenDetails>
  spread: number
}

const SpreadInformation: React.FC<SpreadInformationProps> = ({ selectedTokensMap, spread }) => {
  const tokenSymbolsString = React.useMemo(() => Array.from(selectedTokensMap.values()).map(token => token.symbol), [
    selectedTokensMap,
  ])

  return (
    <SpreadInformationWrapper>
      <strong>Sell Spread</strong>
      <p>
        {tokenSymbolsString.join(', ')} for <b>at least</b> <br />
        <i>${(1 + spread / 100).toFixed(DEFAULT_DECIMALS)}</i>
      </p>
      <strong>Buy Spread</strong>
      <p>
        {tokenSymbolsString.join(', ')} for <b>at most</b> <br />
        <i>${(1 - spread / 100).toFixed(DEFAULT_DECIMALS)}</i>
      </p>
    </SpreadInformationWrapper>
  )
}

export const CreateStrategy: React.FC<CreateStrategyProps> = ({
  selectedTokensMap,
  spread,
  txIdentifier,
  txReceipt,
  txError,
  isSubmitting,
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
          <DefineSpread spread={spread} isSubmitting={isSubmitting} />
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

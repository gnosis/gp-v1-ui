import React from 'react'
import { TokenDetails } from '@gnosis.pm/dex-js'

// types, util, const
import { Receipt } from 'types'
import { formatPartialNumber } from 'utils'
import { INPUT_PRECISION_SIZE } from 'const'

// PoolingWidget: subcomponents
import { BlueBoldText, SpreadInformationWrapper } from 'components/PoolingWidget/DefineSpread.styled'
import DefineSpread from 'components/PoolingWidget/DefineSpread'
import { CreateStrategyWrapper } from 'components/PoolingWidget/CreateStrategy.styled'
import AddFunding from 'components/PoolingWidget/AddFunding'

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
  const tokenSymbolsString = React.useMemo(() => Array.from(selectedTokensMap.values()).map((token) => token.symbol), [
    selectedTokensMap,
  ])

  return (
    <SpreadInformationWrapper>
      <strong>Sell Spread</strong>
      <p>
        {tokenSymbolsString.join(', ')} for:
        <br />
        <b>at least</b> <i>${formatPartialNumber((1 + spread / 100).toFixed(INPUT_PRECISION_SIZE + 2))}</i>
      </p>
      <strong>Buy Spread</strong>
      <p>
        {tokenSymbolsString.join(', ')} for:
        <br />
        <b>at most</b> <i>${formatPartialNumber((1 - spread / 100).toFixed(INPUT_PRECISION_SIZE + 2))}</i>
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

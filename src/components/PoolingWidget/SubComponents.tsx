import React from 'react'

import TokenSelector from './TokenSelector'
import { TokenSelectorProps } from './TokenSelector'
import DefineSpread from './DefineSpread'

import { TokenDetails } from '@gnosis.pm/dex-js'
import { CreateStrategy } from './CreateStrategy'
import { Receipt } from 'types'

interface SubComponentProps extends TokenSelectorProps {
  step: number
  selectedTokensMap: Map<number, TokenDetails>
  spread: number
  setSpread: React.Dispatch<React.SetStateAction<number>>
  txHash: string
  txReceipt?: Receipt
  txError?: Error
}

const SubComponents: React.FC<SubComponentProps> = props => {
  const { step, handleTokenSelect, selectedTokensMap, tokens, spread, setSpread, txHash, txReceipt, txError } = props

  switch (step) {
    case 1:
      return (
        <>
          <TokenSelector handleTokenSelect={handleTokenSelect} tokens={tokens} selectedTokensMap={selectedTokensMap} />
          {/* <GreySubText>
            Please select at least two tokens to continue{' '}
            {selectedTokensMap.size >= 2 && <FontAwesomeIcon icon={faCheckCircle} color="green" />}
          </GreySubText> */}
        </>
      )
    case 2:
      return <DefineSpread selectedTokensMap={selectedTokensMap} spread={spread} setSpread={setSpread} />
    case 3:
      return (
        <>
          <CreateStrategy
            spread={spread}
            selectedTokensMap={selectedTokensMap}
            txIdentifier={txHash}
            txReceipt={txReceipt}
            txError={txError}
          />
        </>
      )
    default:
      return (
        <TokenSelector handleTokenSelect={handleTokenSelect} tokens={tokens} selectedTokensMap={selectedTokensMap} />
      )
  }
}

export default SubComponents

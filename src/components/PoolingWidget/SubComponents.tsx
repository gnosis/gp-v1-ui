import React from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'

import TokenSelector from './TokenSelector'
import { TokenSelectorProps } from './TokenSelector'
import DefineSpread from './DefineSpread'
import AddFunding from './AddFunding'
import { GreySubText } from './PoolingWidget.styled'

import { TokenDetails } from '@gnosis.pm/dex-js'
import { CreateStrategy } from './CreateStrategy'

interface SubComponentProps extends TokenSelectorProps {
  step: number
  selectedTokensMap: Map<number, TokenDetails>
  spread: number
  setSpread: React.Dispatch<React.SetStateAction<number>>
  txHash: string
}

const SubComponents: React.FC<SubComponentProps> = props => {
  const { step, handleTokenSelect, selectedTokensMap, tokens, spread, setSpread, txHash } = props

  switch (step) {
    case 1:
      return (
        <>
          <TokenSelector handleTokenSelect={handleTokenSelect} tokens={tokens} selectedTokensMap={selectedTokensMap} />
          <GreySubText>
            Please select at least two tokens to continue{' '}
            {selectedTokensMap.size >= 2 && <FontAwesomeIcon icon={faCheckCircle} color="green" />}
          </GreySubText>
        </>
      )
    case 2:
      return <DefineSpread selectedTokensMap={selectedTokensMap} spread={spread} setSpread={setSpread} />
    case 3:
      return (
        <>
          <CreateStrategy spread={spread} selectedTokensMap={selectedTokensMap} />
          <GreySubText>Review your strategy summary above and then send your transaction</GreySubText>
        </>
      )
    case 4:
      return (
        <>
          <AddFunding txIdentifier={txHash} />
          <GreySubText>Review the funding in the Wallet page</GreySubText>
        </>
      )
    default:
      return (
        <TokenSelector handleTokenSelect={handleTokenSelect} tokens={tokens} selectedTokensMap={selectedTokensMap} />
      )
  }
}

export default SubComponents

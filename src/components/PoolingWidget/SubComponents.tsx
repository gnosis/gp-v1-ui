import React from 'react'

import TokenSelector from './TokenSelector'
import DefineSpread from './DefineSpread'
import { TokenSelectorProps } from './TokenSelector'
import { GreySubText } from './PoolingWidget.styled'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import { TokenDetails } from '@gnosis.pm/dex-js'
import { CreateStrategy } from './CreateStrategy'

interface SubComponentProps extends TokenSelectorProps /* , All Other Steps */ {
  step: number
  selectedTokensMap: Map<number, TokenDetails>
}

const SubComponents: React.FC<SubComponentProps> = props => {
  const { step, handleTokenSelect, selectedTokensMap, tokens } = props

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
      return <DefineSpread selectedTokensMap={selectedTokensMap} defaultSpread={0.2} />
    case 3:
      return (
        <>
          <CreateStrategy spread={spread} selectedTokensMap={selectedTokensMap} />
          <GreySubText>Review your strategy summary above and then send your transaction</GreySubText>
        </>
      )
    case 4:
      return <div>Step 4</div>
    default:
      return (
        <TokenSelector handleTokenSelect={handleTokenSelect} tokens={tokens} selectedTokensMap={selectedTokensMap} />
      )
  }
}

export default SubComponents

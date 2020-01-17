import React from 'react'

import TokenSelector from './TokenSelector'
import { TokenSelectorProps } from './TokenSelector'

interface SubComponentProps extends TokenSelectorProps /* , All Other Steps */ {
  step: number
}

const SubComponents: React.FC<SubComponentProps> = props => {
  const { step, handleTokenSelect, selectedTokensMap, tokens } = props

  switch (step) {
    case 1:
      return (
        <TokenSelector handleTokenSelect={handleTokenSelect} tokens={tokens} selectedTokensMap={selectedTokensMap} />
      )
    case 2:
      return <div>Step 2 </div>
    case 3:
      return <div>Step 3</div>
    case 4:
      return <div>Step 4</div>
    default:
      return (
        <TokenSelector handleTokenSelect={handleTokenSelect} tokens={tokens} selectedTokensMap={selectedTokensMap} />
      )
  }
}

export default SubComponents

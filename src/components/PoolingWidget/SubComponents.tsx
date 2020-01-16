import React from 'react'

import TokenSelector from './TokenSelector'
import { TokenSelectorProps } from './TokenSelector'

interface SubComponentProps extends TokenSelectorProps /* , All Other Steps */ {
  step: number
}

const SubComponents: React.FC<SubComponentProps> = props => {
  const { step, handleTokenSelect, selectedTokens, tokens } = props
  return step === 1 ? (
    // STEP 1 - SELECT STABLECOINS
    <TokenSelector handleTokenSelect={handleTokenSelect} tokens={tokens} selectedTokens={selectedTokens} />
  ) : step === 2 ? (
    // STEP 2 - SELECT SPREAD
    <div>Step 2</div>
  ) : step === 3 ? (
    // STEP 3 - CREATE STRATEGY
    <div>Step 3</div>
  ) : (
    // STEP 4 - ADD FUNDS
    <div>Step 4</div>
  )
}

export default SubComponents

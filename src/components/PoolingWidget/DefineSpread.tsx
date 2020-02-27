import React from 'react'
import { TokenDetails } from '@gnosis.pm/dex-js'

import { SpreadInformationWrapper, DefineSpreadWrapper } from './DefineSpread.styled'

import { DEFAULT_DECIMALS } from 'const'

interface DefineSpreadProps {
  selectedTokensMap: Map<number, TokenDetails>

  spread: number
  setSpread: React.Dispatch<React.SetStateAction<number>>

  nextStep: () => void
}

type SpreadInformationProps = Omit<DefineSpreadProps, 'setSpread' | 'nextStep'>

export const SpreadInformation: React.FC<SpreadInformationProps> = ({ selectedTokensMap, spread }) => {
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

  const handleSpreadChange = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>): void => {
    if (+value < 0 || +value >= 100) return
const DefineSpread: React.FC<DefineSpreadProps> = ({ selectedTokensMap, spread, setSpread, nextStep }) => {

    setSpread(+value)
  }

  return (
    <DefineSpreadWrapper>
      <strong>Spread %</strong>
      <input type="number" step="0.1" value={spread} onChange={handleSpreadChange} />
      <SpreadInformation selectedTokensMap={selectedTokensMap} spread={spread} />
    </DefineSpreadWrapper>
  )
}

export default DefineSpread

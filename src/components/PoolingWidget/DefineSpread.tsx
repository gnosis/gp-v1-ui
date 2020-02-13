import React from 'react'
import { TokenDetails } from '@gnosis.pm/dex-js'

import { CardTable } from 'components/Layout/Card'
import { SpreadInformationWrapper, DefineSpreadWrapper, RedBoldText } from './DefineSpread.styled'

import { DEFAULT_DECIMALS } from 'const'

interface DefineSpreadProps {
  selectedTokensMap: Map<number, TokenDetails>

  spread: number
  setSpread: React.Dispatch<React.SetStateAction<number>>
}

type SpreadInformationProps = Omit<DefineSpreadProps, 'setSpread'>

export const SpreadInformation: React.FC<SpreadInformationProps> = ({ selectedTokensMap, spread }) => {
  const tokenSymbolsString = React.useMemo(() => Array.from(selectedTokensMap.values()).map(token => token.symbol), [
    selectedTokensMap,
  ])

  return (
    <SpreadInformationWrapper>
      Test
    </SpreadInformationWrapper>
  )
}

const DefineSpread: React.FC<DefineSpreadProps> = ({ selectedTokensMap, spread, setSpread }) => {
  const handleSpreadChange = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>): void => {
    if (+value < 0 || +value >= 100) return

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

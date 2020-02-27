import React, { useCallback } from 'react'
import { TokenDetails, adjustPrecision } from '@gnosis.pm/dex-js'

import { SpreadInformationWrapper, DefineSpreadWrapper } from './DefineSpread.styled'

import { DEFAULT_DECIMALS } from 'const'
import { formatPartialNumber, preventInvalidChars } from 'utils'

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

const DefineSpread: React.FC<DefineSpreadProps> = ({ selectedTokensMap, spread, setSpread, nextStep }) => {
  const onChange = useCallback(
    ({ currentTarget: { value } }: React.SyntheticEvent<HTMLInputElement>): void => {
      if (+value === NaN || +value <= 0 || +value >= 100) {
        return
      }

      const newValue = formatPartialNumber(value)

      setSpread(Number(newValue))
    },
    [setSpread],
  )

  const onBlur = useCallback(
    ({ currentTarget: { value } }: React.SyntheticEvent<HTMLInputElement>): void => {
      const newValue = adjustPrecision(value, 1)

      setSpread(Number(newValue))
    },
    [setSpread],
  )

  const onKeyPress = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>): void => {
      if (event.key === 'Enter') {
        onBlur(event)
        nextStep()
      } else {
        preventInvalidChars(event)
      }
    },
    [nextStep, onBlur],
  )

  return (
    <DefineSpreadWrapper>
      <strong>Spread %</strong>
      <input type="number" step="0.1" value={spread} onChange={onChange} onBlur={onBlur} onKeyPress={onKeyPress} />
      <SpreadInformation selectedTokensMap={selectedTokensMap} spread={spread} />
    </DefineSpreadWrapper>
  )
}

export default DefineSpread

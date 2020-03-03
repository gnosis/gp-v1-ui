import React, { useCallback } from 'react'
import { TokenDetails /* , adjustPrecision */ } from '@gnosis.pm/dex-js'

import { SpreadInformationWrapper, DefineSpreadWrapper } from './DefineSpread.styled'

import InputWithTooltip from '../InputWithTooltip'

import { DEFAULT_DECIMALS } from 'const'
import { useFormContext } from 'react-hook-form'

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

const DefineSpread: React.FC<DefineSpreadProps> = ({ selectedTokensMap, spread, setSpread }) => {
  const { errors, register } = useFormContext()

  // const onChange = useCallback(
  //   ({ currentTarget: { value } }: React.SyntheticEvent<HTMLInputElement>): void => {
  //     // const newValue = value
  //     //   // put a `0` at the start, if starting with `.`
  //     //   .replace(/^(\..*)$/, '0$1')
  //     //   // remove extra decimal places, if present and more than 1
  //     //   .replace(/^(.*\.\d{0,1}).*$/, '$1')

  //     setSpread(Number(value))
  //   },
  //   [setSpread],
  // )
  // const onBlur = useCallback(
  //   ({ currentTarget: { value } }: React.SyntheticEvent<HTMLInputElement>): void => {
  //     let newValue

  //     // Adjust amount in case invalid
  //     if (isNaN(+value) || +value <= 0) {
  //       // set min value
  //       newValue = '0.1'
  //     } else if (+value >= 100) {
  //       // set max value
  //       newValue = '99.9'
  //     } else {
  //       newValue = adjustPrecision(value, 1)
  //     }

  //     setSpread(Number(newValue))
  //   },
  //   [setSpread],
  // )

  // const onKeyPress = useCallback(
  //   (event: React.KeyboardEvent<HTMLInputElement>): void => {
  //     if (event.key === 'Enter') {
  //       onBlur(event)
  //       nextStep()
  //     } else if (
  //       // allow to remove chars and add numbers and a dot
  //       !/(Backspace|Delete|\.|[0-9])/.test(event.key) ||
  //       // do not allow a second dot
  //       (event.key === '.' && event.currentTarget.value.includes('.'))
  //     ) {
  //       event.preventDefault()
  //     }
  //   },
  //   [nextStep, onBlur],
  // )
  function formatErrorMessage(errorString: string): string {
    const cleanedString = errorString.replace(/"/g, '')
    return cleanedString[0].toUpperCase() + cleanedString.slice(1)
  }
  return (
    <DefineSpreadWrapper>
      <strong>Spread %</strong>
      <InputWithTooltip
        name="spread"
        type="number"
        step={0.1}
        ref={register}
        // value={spread}
        // onChange={onChange}
        // onBlur={onBlur}
        // onKeyPress={onKeyPress}
        tooltip={
          (errors?.spread?.message && formatErrorMessage(errors.spread.message)) ||
          'Value between 0 and 100, not inclusive'
        }
        showErrorStyle={!!errors?.spread?.message}
      />
      <SpreadInformation selectedTokensMap={selectedTokensMap} spread={spread} />
    </DefineSpreadWrapper>
  )
}

export default DefineSpread

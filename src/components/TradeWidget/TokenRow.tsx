import React, { useEffect, useCallback } from 'react'
import BN from 'bn.js'
import styled from 'styled-components'
import { useFormContext } from 'react-hook-form'
import TokenSelector from 'components/TokenSelector'
import { TokenDetails, TokenBalanceDetails } from 'types'
import {
  formatAmount,
  formatAmountFull,
  parseAmount,
  adjustPrecision,
  validInputPattern,
  leadingAndTrailingZeros,
  trailingZerosAfterDot,
  validatePositive,
} from 'utils'
import { ZERO } from 'const'

import { TradeFormTokenId, TradeFormData } from './'

import { TooltipWrapper } from 'components/Tooltip'

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-flow: column wrap;

  > div:first-of-type {
    width: 100%;
    display: flex;
    flex-flow: row nowrap;
    margin: 0 0 1rem;
    padding: 0 1rem;
    box-sizing: border-box;
  }

  > div > strong {
    margin: 0 auto 0 0;
    text-transform: capitalize;
    color: #2f3e4e;
  }

  > div > span {
    display: flex;
    flex-flow: row nowrap;
    font-size: 1.3rem;
    color: #218dff;
    letter-spacing: -0.03rem;
    text-align: right;
  }

  > div > span > button {
    background: 0;
    font-weight: var(--font-weight-normal);
    color: var(--color-text-active);
    font-size: inherit;
    margin: 0;
    padding: 0;
    text-decoration: underline;

    &::after {
      content: '-';
      margin: 0 0.5rem;
      display: inline-block;
      color: #9fb4c9;
      text-decoration: none;
    }
  }

  > div > span > span {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-items: center;
    color: #9fb4c9;
  }
`

const InputBox = styled.div`
  display: flex;
  flex-flow: row nowrap;
  margin: 0;
  width: 100%;
  height: 5.6rem;
  position: relative;

  input {
    margin: 0;
    width: 100%;
    background: #e7ecf3;
    border-radius: 0.6rem 0.6rem 0 0;
    border: 0;
    font-size: 1.6rem;
    line-height: 1;
    box-sizing: border-box;
    border-bottom: 0.2rem solid transparent;
    font-weight: var(--font-weight-normal);
    padding: 0 15rem 0 1rem;
    outline: 0;

    &:focus {
      border-bottom: 0.2rem solid #218dff;
      border-color: #218dff;
      color: #218dff;
    }

    &.error {
      border-color: #ff0000a3;
    }

    &.warning {
      color: #ff5722;
    }

    &:disabled {
      box-shadow: none;
    }
  }
`

const WalletDetail = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: inherit;
  margin: 0 0 0 0.3rem;
  color: #476481;

  > a {
    color: #218dff;
    margin: 0 0 0 0.3rem;
  }

  .success {
    color: green;
    text-decoration: none;
  }

  &.error,
  &.warning {
    margin: 1rem 0;
    line-height: 1.2;
    font-size: 1.2rem;
    display: block;
    > strong {
      color: inherit;
    }
  }

  &.error {
    color: red;
  }
  &.warning {
    color: #476481;
    background: #fff0eb;
    border-radius: 0 0 0.3rem 0.3rem;
    padding: 0.5rem;
    box-sizing: border-box;
    margin: 0.3rem 0 1rem;
  }
`

const TokenBoxWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  position: absolute;
  right: 1rem;
  top: 0;
  bottom: 0;
  margin: auto;
`

const TokenEnable = styled.div`
  height: 3.8rem;
  margin: auto -3.2rem auto 0;
  font-size: 1.4rem;
  color: #218dff;
  letter-spacing: -0.05rem;
  text-align: center;
  font-weight: var(--font-weight-medium);
  display: flex;
  align-items: center;
  padding: 0 4.2rem 0 1.6rem;
  box-sizing: border-box;
  background: #deeeff;
  border: 0.1rem solid #218dff;
  border-radius: 2rem;
  cursor: pointer;
  transition: background 0.2s ease-in-out, color 0.2s ease-in-out;

  &:hover {
    background: #218dff;
    color: #ffffff;
  }
`

// function displayBalance<K extends keyof TokenBalanceDetails>(
//   balance: TokenBalanceDetails | undefined | null,
//   key: K,
// ): string {
//   if (!balance) {
//     return '0'
//   }
//   return formatAmount(balance[key] as BN, balance.decimals) || '0'
// }

function preventInvalidChars(event: React.KeyboardEvent<HTMLInputElement>): void {
  if (!validInputPattern.test(event.currentTarget.value + event.key)) {
    event.preventDefault()
  }
}

interface Props {
  selectedToken: TokenDetails
  tokens: TokenDetails[]
  balance: TokenBalanceDetails
  selectLabel: string
  onSelectChange: (selected: TokenDetails) => void
  inputId: TradeFormTokenId
  isDisabled: boolean
  validateMaxAmount?: true
  tabIndex: number
}

const TokenRow: React.FC<Props> = ({
  selectedToken,
  tokens,
  selectLabel,
  onSelectChange,
  balance,
  inputId,
  isDisabled,
  validateMaxAmount,
  tabIndex,
}) => {
  const { register, errors, setValue, watch } = useFormContext<TradeFormData>()
  const error = errors[inputId]
  const inputValue = watch(inputId)

  let overMax = ZERO
  if (balance && validateMaxAmount) {
    const max = balance.totalExchangeBalance
    const value = new BN(parseAmount(inputValue, selectedToken.decimals) || '0')
    overMax = value.gt(max) ? value.sub(max) : ZERO
  }

  const className = error ? 'error' : overMax.gt(ZERO) ? 'warning' : ''

  const errorOrWarning = error ? (
    <WalletDetail className="error">{error.message}</WalletDetail>
  ) : (
    overMax.gt(ZERO) && (
      <WalletDetail className="warning">
        <b>INFO</b>: Sell amount exceeding your balance by{' '}
        <strong>
          {formatAmountFull(overMax, selectedToken.decimals)} {selectedToken.symbol}
        </strong>
        . This creates a standing order. <a href="#">Read more</a>.
      </WalletDetail>
    )
  )

  function useMax(): void {
    // boolean true here forces form validation
    setValue(inputId, formatAmountFull(balance.totalExchangeBalance, balance.decimals, false), true)
  }

  const enforcePrecision = useCallback(() => {
    const newValue = adjustPrecision(inputValue, selectedToken.decimals)
    if (inputValue !== newValue) {
      setValue(inputId, newValue, true)
    }
  }, [inputValue, selectedToken.decimals, setValue, inputId])

  useEffect(() => {
    enforcePrecision()
  }, [enforcePrecision])

  const removeExcessZeros = useCallback(
    (event: React.SyntheticEvent<HTMLInputElement>): void => {
      // Q: Why do we need this function instead of relying on `preventInvalidChars` or `enforcePrecision`?
      // A: Because on those functions we still want the user to be able to input partial values. E.g.:
      //    0 -> 0. -> 0.1 -> 0.10 -> 0.105
      //    When losing focus though (`onBlur`), we remove everything that's redundant, such as leading zeros,
      //    trailing dots and/or zeros
      // Q: Why not use formatAmount/parseAmount that already take care of this?
      // A: Too many steps (convert to and from BN) and binds the function to selectedToken.decimals

      const { value } = event.currentTarget
      const newValue = value.replace(leadingAndTrailingZeros, '').replace(trailingZerosAfterDot, '$1')

      if (value != newValue) {
        setValue(inputId, newValue, true)
      }
    },
    [inputId, setValue],
  )

  const onKeyPress = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>): void =>
      event.key === 'Enter' ? removeExcessZeros(event) : preventInvalidChars(event),
    [removeExcessZeros],
  )

  return (
    <Wrapper>
      <div>
        <strong>{selectLabel}</strong>
        <span>
          {/* can pass props to as={Component} */}
          <TooltipWrapper as="button" tooltip="Deposit" onClick={console.log}>
            + Deposit
          </TooltipWrapper>
          {/* <button>+ Deposit</button> */}
          <span>
            Balance:
            <TooltipWrapper as={WalletDetail} tooltip="Fill maximum">
              {' '}
              {balance ? formatAmount(balance.totalExchangeBalance, balance.decimals) : '0'}
              {validateMaxAmount && <a onClick={useMax}>max</a>}
            </TooltipWrapper>
            <i aria-label="Tooltip"></i>
          </span>
        </span>
      </div>
      <InputBox>
        {/* focus = false as we already do stuff onFocus; to combine tooltips better use hook */}
        <TooltipWrapper tooltip="input amount" focus={false}>
          <input
            className={className}
            placeholder="0"
            name={inputId}
            type="text"
            disabled={isDisabled}
            required
            ref={register({
              pattern: { value: validInputPattern, message: 'Invalid amount' },
              validate: { positive: validatePositive },
            })}
            onKeyPress={onKeyPress}
            onChange={enforcePrecision}
            onBlur={removeExcessZeros}
            tabIndex={tabIndex + 2}
            onFocus={(e): void => e.target.select()}
          />
        </TooltipWrapper>

        {/* <WalletDetail>
          <div>
            <strong>Wallet:</strong> {displayBalance(balance, 'walletBalance')}
          </div>
        </WalletDetail> */}
        {/* <TokenImgWrapper alt={selectedToken.name} src={selectedToken.image} /> */}
        {/* Using TokenBoxWrapper to use a single parent for the ENABLE button and TokenSelector */}
        <TokenBoxWrapper>
          <TokenEnable>Enable</TokenEnable>
          <TokenSelector
            label={selectLabel}
            isDisabled={isDisabled}
            tokens={tokens}
            selected={selectedToken}
            onChange={onSelectChange}
            tabIndex={tabIndex}
          />
        </TokenBoxWrapper>
      </InputBox>
      {errorOrWarning}
    </Wrapper>
  )
}

export default TokenRow

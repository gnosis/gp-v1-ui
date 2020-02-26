import React, { useMemo } from 'react'
import BN from 'bn.js'
import styled from 'styled-components'
import { useFormContext } from 'react-hook-form'
import TokenSelector from 'components/TokenSelector'
import { TokenDetails, TokenBalanceDetails } from 'types'
import { formatAmount, formatAmountFull, parseAmount, validInputPattern, validatePositive } from 'utils'
import { ZERO } from 'const'

import { TradeFormTokenId, TradeFormData } from './'

import { TooltipWrapper } from 'components/Tooltip'
import FormMessage from './FormMessage'
import { useNumberInput } from './useNumberInput'
import InputWithTooltip from './InputWithTooltip'

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
  font-weight: var(--font-weight-bold);
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
  readOnly: boolean
  tooltipText: string
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
  readOnly = false,
  tooltipText,
}) => {
  const isEditable = isDisabled || readOnly
  const { register, errors, setValue, watch } = useFormContext<TradeFormData>()
  const error = errors[inputId]
  const inputValue = watch(inputId)

  const { onKeyPress, enforcePrecision, removeExcessZeros } = useNumberInput({
    inputId,
    precision: selectedToken.decimals,
  })

  let overMax = ZERO
  if (balance && validateMaxAmount) {
    const max = balance.totalExchangeBalance
    const value = new BN(parseAmount(inputValue, selectedToken.decimals) || '0')
    overMax = value.gt(max) ? value.sub(max) : ZERO
  }

  const className = error ? 'error' : overMax.gt(ZERO) ? 'warning' : ''

  const errorOrWarning = error ? (
    <FormMessage className="error">{error.message}</FormMessage>
  ) : (
    overMax.gt(ZERO) && (
      <FormMessage className="warning">
        <b>INFO</b>: Sell amount exceeding your balance by{' '}
        <strong>
          {formatAmountFull(overMax, selectedToken.decimals)} {selectedToken.symbol}
        </strong>
        . This creates a standing order. <a href="#">Read more</a>.
      </FormMessage>
    )
  )

  function useMax(): void {
    // boolean true here forces form validation
    setValue(inputId, formatAmountFull(balance.totalExchangeBalance, balance.decimals, false), true)
  }

  // Form validation
  const inputRef = useMemo(
    () =>
      !readOnly
        ? register({
            pattern: { value: validInputPattern, message: 'Invalid amount' },
            validate: { positive: validatePositive },
          })
        : register,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [register],
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
            <TooltipWrapper as={FormMessage} tooltip="Fill maximum">
              {' '}
              {balance ? formatAmount(balance.totalExchangeBalance, balance.decimals) : '0'}
              {validateMaxAmount && <a onClick={useMax}>max</a>}
            </TooltipWrapper>
            <i aria-label="Tooltip"></i>
          </span>
        </span>
      </div>
      <InputBox>
        <InputWithTooltip
          className={className}
          tooltip={tooltipText}
          placeholder="0"
          name={inputId}
          type="text"
          disabled={isEditable}
          readOnly={readOnly}
          required
          ref={inputRef}
          onKeyPress={onKeyPress}
          onChange={enforcePrecision}
          onBlur={removeExcessZeros}
          tabIndex={tabIndex + 2}
          onFocus={(e): void => e.target.select()}
        />

        {/*
        <FormMessage>
          <div>
            <strong>Wallet:</strong> {displayBalance(balance, 'walletBalance')}
          </div>
        </FormMessage>
        */}
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

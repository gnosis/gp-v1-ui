import React, { useMemo } from 'react'
import BN from 'bn.js'
import styled from 'styled-components'
import { useFormContext } from 'react-hook-form'
import TokenSelector from 'components/TokenSelector'
import { TokenDetails, TokenBalanceDetails } from 'types'
import { formatAmount, formatAmountFull, parseAmount, validInputPattern, validatePositiveConstructor } from 'utils'
import { ZERO } from 'const'
import { DEFAULT_MODAL_OPTIONS } from '../Modal'
import Modali, { useModali } from 'modali'

import { TradeFormTokenId, TradeFormData } from './'

import { TooltipWrapper, HelpTooltipContainer, HelpTooltip } from 'components/Tooltip'
import FormMessage, { FormInputError } from './FormMessage'
import { useNumberInput } from './useNumberInput'
import InputWithTooltip from '../InputWithTooltip'
import { MEDIA } from 'const'

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
    padding: 0;
    box-sizing: border-box;
  }

  > div > strong {
    margin: 0 auto 0 0;
    text-transform: capitalize;
    color: var(--color-text-primary);
    display: flex;
    align-items: center;
    font-size: 1.5rem;

    @media ${MEDIA.mobile} {
      font-size: 1.3rem;
    }
  }

  > div > span {
    display: flex;
    flex-flow: row nowrap;
    font-size: 1.3rem;
    color: var(--color-text-active);
    letter-spacing: -0.03rem;
    text-align: right;
  }

  > div > span > span > ${FormMessage} {
    margin: 0 0 0 0.25rem;
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
      color: var(--color-text-secondary);
      text-decoration: none;
    }
  }

  > div > span > span {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-items: center;
    color: var(--color-text-secondary);
  }
`

export const InputBox = styled.div`
  display: flex;
  flex-flow: row nowrap;
  margin: 0;
  width: 100%;
  height: 5.6rem;
  position: relative;

  input {
    margin: 0;
    width: 100%;
    background: var(--color-background-input);
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
      border-bottom: 0.2rem solid var(--color-text-active);
      border-color: var(--color-text-active);
      color: var(--color-text-active);
    }

    &.error {
      border-color: var(--color-error);
    }

    &.warning {
      color: #ff5722;
    }

    &:disabled {
      box-shadow: none;
    }

    &[readonly] {
      background-color: var(--color-background-pageWrapper);
      border: 1px solid var(--color-background-input);
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
  color: var(--color-text-active);
  letter-spacing: -0.05rem;
  text-align: center;
  font-weight: var(--font-weight-bold);
  display: flex;
  align-items: center;
  padding: 0 4.2rem 0 1.6rem;
  box-sizing: border-box;
  background: var(--color-background-row-hover);
  border: 0.1rem solid var(--color-text-active);
  border-radius: 2rem;
  cursor: pointer;
  transition: background 0.2s ease-in-out, color 0.2s ease-in-out;
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
  autoFocus?: boolean
}

const BalanceTooltip = (
  <HelpTooltipContainer>
    This balance reflects the amount deposited in the Exchange Wallet on Mesa. Only orders with a balance will be
    considered for matching.
  </HelpTooltipContainer>
)

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
  autoFocus,
}) => {
  const isEditable = isDisabled || readOnly
  const { register, errors, setValue, watch } = useFormContext<TradeFormData>()
  const error = errors[inputId]
  const inputValue = watch(inputId)

  const { onKeyPress, enforcePrecision, removeExcessZeros } = useNumberInput({
    inputId,
    precision: selectedToken.decimals,
  })

  const [wrapEtherModal, toggleWrapEtherModal] = useModali({
    ...DEFAULT_MODAL_OPTIONS,
    title: 'Wrap Ether',
    message: (
      <div>
        <div>
          <p>
            You currently have a pending withdraw request. By sending this new withdraw request, you will overwrite the
            pending request amount. No funds will be lost.
          </p>
          <p>No funds will be lost.</p>
        </div>
        <strong>Do you wish to replace the previous withdraw request?</strong>
      </div>
    ),
    buttons: [
      <Modali.Button label="Cancel" key="no" isStyleCancel onClick={(): void => toggleWrapEtherModal()} />,
      <Modali.Button
        label="Continue"
        key="yes"
        isStyleDefault
        onClick={async (): Promise<void> => {
          alert('Continue!')
        }}
      />,
    ],
  })

  let overMax = ZERO
  if (balance && validateMaxAmount) {
    const max = balance.totalExchangeBalance
    const value = new BN(parseAmount(inputValue, selectedToken.decimals) || '0')
    overMax = value.gt(max) ? value.sub(max) : ZERO
  }
  const sellAmountOverMax = overMax.gt(ZERO)
  const balanceClassName = !error && sellAmountOverMax ? 'warning' : 'success'
  const inputClassName = error ? 'error' : sellAmountOverMax ? 'warning' : ''

  const errorOrWarning = error?.message ? (
    <FormInputError errorMessage={error.message as string} />
  ) : (
    overMax.gt(ZERO) && (
      <FormMessage className="warning">
        <b>INFO:</b>
        <i>Sell amount exceeding your balance by</i>
        <strong>
          {formatAmountFull({ amount: overMax, precision: selectedToken.decimals })} {selectedToken.symbol}.
        </strong>
        {/* This creates a standing order. <a href="#">Read more</a>. */}
      </FormMessage>
    )
  )

  function useMax(): void {
    // boolean true here forces form validation
    setValue(
      inputId,
      formatAmountFull({
        amount: balance.totalExchangeBalance,
        precision: balance.decimals,
        thousandSeparator: false,
        isLocaleAware: false,
      }),
      true,
    )
  }

  // Form validation
  const inputRef = useMemo(
    () =>
      !readOnly
        ? register({
            pattern: { value: validInputPattern, message: 'Invalid amount' },
            validate: { positive: validatePositiveConstructor('Invalid amount') },
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
          {!readOnly && (
            // TODO: Implement deposit in Trade widget
            //  https://github.com/gnosis/dex-react/issues/610
            <TooltipWrapper
              className="not-implemented"
              as="button"
              type="button"
              tooltip="Deposit"
              onClick={(): void => alert('Not implemented yet!')}
            >
              + Deposit
            </TooltipWrapper>
          )}
          {selectedToken.symbol && selectedToken.symbol === 'WETH' && (
            <TooltipWrapper
              as="button"
              type="button"
              tooltip="Ether needs to be Wrapped and then deposited into the Exchange balance in order to be traded"
              onClick={toggleWrapEtherModal}
            >
              + Wrap Ether
            </TooltipWrapper>
          )}
          <span>
            Balance:
            {readOnly ? (
              <FormMessage className={balanceClassName}>
                {' '}
                {balance ? formatAmount(balance.totalExchangeBalance, balance.decimals) : '0'}
              </FormMessage>
            ) : (
              <FormMessage className={balanceClassName}>
                {' '}
                {balance ? formatAmount(balance.totalExchangeBalance, balance.decimals) : '0'}
                {validateMaxAmount && (
                  <>
                    <TooltipWrapper tooltip="Fill maximum">
                      <a onClick={useMax}>max</a>
                    </TooltipWrapper>
                    <i aria-label="Tooltip"></i>
                  </>
                )}
              </FormMessage>
            )}
            &nbsp;
            <HelpTooltip tooltip={BalanceTooltip} />
          </span>
        </span>
      </div>
      <InputBox>
        <InputWithTooltip
          autoFocus={!readOnly && autoFocus}
          className={inputClassName}
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
          tabIndex={tabIndex}
          onFocus={(e): void => e.target.select()}
        />

        {/* Using TokenBoxWrapper to use a single parent for the ENABLE button and TokenSelector */}
        <TokenBoxWrapper>
          {/* TODO: Implement enable token in Trade widget */}
          {/*   https://github.com/gnosis/dex-react/issues/611 */}
          {!readOnly && <TokenEnable className="not-implemented">Enable</TokenEnable>}
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
      <Modali.Modal {...wrapEtherModal} />
    </Wrapper>
  )
}

export default TokenRow

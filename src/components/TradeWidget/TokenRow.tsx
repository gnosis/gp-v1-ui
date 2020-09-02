import React, { useMemo, useState } from 'react'
import BN from 'bn.js'
import styled from 'styled-components'
import { useFormContext } from 'react-hook-form'

// types, const and utils
import { TokenDetails, TokenBalanceDetails } from 'types'
import { ZERO, MEDIA, WETH_ADDRESS_MAINNET } from 'const'
import { formatSmart, formatAmountFull, parseAmount, validInputPattern, validatePositiveConstructor } from 'utils'

// components
import TokenSelector from 'components/TokenSelector'
import Form from 'components/DepositWidget/Form'
import { TooltipWrapper, HelpTooltipContainer, HelpTooltip } from 'components/Tooltip'
import { InputBox } from 'components/InputBox'
import { Input } from 'components/Input'
import { Spinner } from 'components/common/Spinner'
import { WrapEtherBtn } from 'components/WrapEtherBtn'

// TradeWidget: subcomponents
import { TradeFormTokenId, TradeFormData } from 'components/TradeWidget'
import { FormInputError } from 'components/common/FormInputError'
import { FormMessage } from 'components/common/FormMessage'
import { faPlus } from '@fortawesome/free-solid-svg-icons'

// Hooks
import useNoScroll from 'hooks/useNoScroll'
import { useNumberInput } from 'components/TradeWidget/useNumberInput'
import { useRowActions } from 'components/DepositWidget/useRowActions'

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-flow: column wrap;

  > div {
    &:first-of-type {
      width: 100%;
      display: flex;
      flex-flow: row nowrap;
      margin: 0 0 1rem;
      padding: 0;
      box-sizing: border-box;
    }

    > strong {
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

    > div {
      display: flex;
      flex-flow: row nowrap;
      font-size: 1.3rem;
      color: var(--color-text-active);
      letter-spacing: -0.03rem;
      text-align: right;

      > span {
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        justify-items: center;
        color: var(--color-text-secondary);

        > ${FormMessage} {
          margin: 0 0 0 0.25rem;
          padding: 0.5rem;
        }
      }

      > button {
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
    }
  }

  div.btn {
    margin: 0 1rem;
    display: flex;
    align-items: center;
    text-decoration: underline;
    cursor: pointer;
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
  inputId: Extract<TradeFormTokenId, 'sellToken' | 'receiveToken'>
  isDisabled: boolean
  validateMaxAmount?: true
  tabIndex: number
  readOnly: boolean
  userConnected?: boolean
  autoFocus?: boolean
}

const BalanceTooltip = (
  <HelpTooltipContainer>
    This balance reflects the amount deposited in the Exchange Wallet on Gnosis Protocol. Only orders with a balance
    will be considered for matching.
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
  userConnected = true,
  autoFocus,
}) => {
  const { register, errors, setValue, watch } = useFormContext<TradeFormData>()
  const error = errors[inputId]

  const inputValue = watch(inputId)

  const { onKeyPress, enforcePrecision, removeExcessZeros } = useNumberInput({
    inputId,
    precision: selectedToken.decimals,
  })

  const [visibleForm, showForm] = useState<'deposit' | void>()

  // Checks innerWidth
  const showResponsive = !!innerWidth && innerWidth < MEDIA.MOBILE_LARGE_PX
  useNoScroll(!!visibleForm && showResponsive)

  const isDepositFormVisible = visibleForm == 'deposit'

  let overMax = ZERO
  if (balance && validateMaxAmount) {
    const max = balance.totalExchangeBalance
    const value = new BN(parseAmount(inputValue, selectedToken.decimals) || '0')
    overMax = value.gt(max) ? value.sub(max) : ZERO
  }
  const sellAmountOverMax = overMax.gt(ZERO)
  const balanceClassName = !error && sellAmountOverMax ? 'warning' : 'success'
  const inputClassName = error ? 'error' : sellAmountOverMax ? 'warning' : ''

  const { depositToken, enableToken, enabled, enabling } = useRowActions({ balances: [balance] })
  const tokenDisabled = !enabled.has(balance.address) && !balance.enabled
  const editableAndConnected = !readOnly && userConnected
  const showEnableToken = editableAndConnected && tokenDisabled

  const isWeth = balance.addressMainnet === WETH_ADDRESS_MAINNET

  const errorOrWarning = error?.message ? (
    <FormInputError errorMessage={error.message as string} />
  ) : (
    overMax.gt(ZERO) && (
      <FormMessage className="warning tradeWarning">
        <i>
          Have you already deposited <b>{selectedToken.symbol}</b> into the exchange wallet?{' '}
        </i>
        {editableAndConnected && !tokenDisabled && (
          <div className="btn" onClick={(): void => showForm('deposit')}>
            + Deposit {selectedToken.symbol}
          </div>
        )}
        <i>
          Sell amount exceeds your balance by:{' '}
          <strong>
            {formatSmart({ amount: overMax, precision: selectedToken.decimals })} <span>{selectedToken.symbol}</span>
          </strong>
        </i>
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
      { shouldValidate: true },
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
        <div>
          {editableAndConnected && !tokenDisabled && (
            <>
              <TooltipWrapper
                as="button"
                type="button"
                tooltip="Deposit tokens into the Exchange Balance so it can be used for trading"
                onClick={(): void => showForm('deposit')}
              >
                + Deposit
              </TooltipWrapper>
              {isDepositFormVisible && (
                <Form
                  title={
                    <span>
                      Deposit <strong>{balance.symbol}</strong> into the Exchange Wallet
                    </span>
                  }
                  totalAmountLabel="wallet balance"
                  totalAmount={balance.walletBalance}
                  inputLabel="Deposit amount"
                  tokenBalances={balance}
                  submitBtnLabel="Deposit"
                  submitBtnIcon={faPlus}
                  onSubmit={(balanceAmt): Promise<void> => depositToken(balanceAmt, balance.address)}
                  onClose={(): void => showForm()}
                  responsive={showResponsive}
                />
              )}
            </>
          )}
          {editableAndConnected && isWeth && <WrapEtherBtn label="+ Wrap Ether" />}
          <span>
            Balance:
            <FormMessage className={balanceClassName}>
              {' '}
              {balance ? formatSmart(balance.totalExchangeBalance, balance.decimals) : '0'}
              {!readOnly && validateMaxAmount && (
                <>
                  <TooltipWrapper tooltip="Fill maximum">
                    <a onClick={useMax}>max</a>
                  </TooltipWrapper>
                  <i aria-label="Tooltip"></i>
                </>
              )}
            </FormMessage>
            &nbsp;
            <HelpTooltip tooltip={BalanceTooltip} />
          </span>
        </div>
      </div>
      <InputBox>
        <Input
          autoFocus={!readOnly && autoFocus}
          className={inputClassName}
          placeholder="0"
          name={inputId}
          type="text"
          disabled={isDisabled}
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
          {enabling.has(balance.address) ? (
            <TokenEnable>
              <Spinner style={{ marginRight: '1rem' }} /> Enabling
            </TokenEnable>
          ) : showEnableToken ? (
            <TokenEnable onClick={(): Promise<void> => enableToken(selectedToken.address)}>Enable</TokenEnable>
          ) : null}
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

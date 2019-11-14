import React, { CSSProperties, useMemo } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import Select from 'react-select'
import { FormatOptionLabelContext } from 'react-select/src/Select'
import { useFormContext } from 'react-hook-form'

import TokenImg from 'components/TokenImg'
import { TokenDetails, TokenBalanceDetails } from 'types'
import { formatAmount, formatAmountFull } from 'utils'

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  height: 6em;
`

const TokenImgWrapper = styled(TokenImg)`
  width: 4em;
  height: 4em;

  margin-right: 1em;
`

const SelectBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;

  margin: 0em 1em;

  label {
    text-transform: uppercase;
    padding-left: 8px; // to align with Select input padding
  }

  input {
    margin-left: 0; // to fix extra space on Select search box
  }
`

const InputBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  flex-grow: 1;

  margin-left: 1em;

  input {
    margin: 0 0 0.5em 0;
    width: 100%;

    &.error {
      box-shadow: 0 0 3px #cc0000;
    }

    &.warning {
      box-shadow: 0 0 3px #ff7500;
    }

    &:disabled {
      box-shadow: none;
    }
  }
`

const WalletDetail = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.75em;

  .success {
    color: green;
    text-decoration: none;
  }

  &.error,
  &.warning {
    margin: 0 0 1em 0;
  }

  &.error {
    color: red;
  }
  &.warning {
    color: orange;
  }
`

function renderOptionLabel(token: TokenDetails): React.ReactNode {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <TokenImgWrapper
        src={token.image}
        alt={token.name}
        style={{
          margin: '0.25em 2em 0.25em 1em',
        }}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div>
          <strong>{token.symbol}</strong>
        </div>
        <div>{token.name}</div>
      </div>
    </div>
  )
}

function formatOptionLabel(
  options: { token: TokenDetails },
  labelMeta: { context: FormatOptionLabelContext },
): React.ReactNode {
  const { token } = options
  const { context } = labelMeta
  return context === 'value' ? <strong>{token.symbol}</strong> : renderOptionLabel(token)
}

const customSelectStyles = {
  control: (provided: CSSProperties): CSSProperties => ({ ...provided, border: 'none' }),
  menu: (provided: CSSProperties): CSSProperties => ({ ...provided, minWidth: '300px' }),
  valueContainer: (provided: CSSProperties): CSSProperties => ({ ...provided, minWidth: '4.5em' }),
}

function displayBalance(balance: TokenBalanceDetails | undefined | null, key: string): string {
  if (!balance) {
    return '0'
  }
  return formatAmount(balance[key], balance.decimals) || '0'
}

function getMax(balance: TokenBalanceDetails | null, token: TokenDetails): string {
  return formatAmountFull((balance || {}).exchangeBalance, token.decimals, false) || '0'
}

// TODO: move into a validators file?
function validatePositive(value: string): true | string {
  return Number(value) > 0 || 'Invalid amount'
}

interface Props {
  selectedToken: TokenDetails
  tokens: TokenDetails[]
  balance: TokenBalanceDetails
  selectLabel: string
  onSelectChange: (selected: TokenDetails) => void
  inputId: string
  isDisabled: boolean
  validateMaxAmount?: true
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
}) => {
  const options = useMemo(() => tokens.map(token => ({ token, value: token.symbol, label: token.name })), [tokens])

  const { register, errors, setValue, watch } = useFormContext()
  const error = errors[inputId]

  const max = Number(getMax(balance, selectedToken))
  const inputValue = Number(watch(inputId)) || 0
  const overMax = validateMaxAmount && inputValue > max ? inputValue - max : 0

  const className = error ? 'error' : !!overMax ? 'warning' : ''

  const errorOrWarning = error ? (
    <WalletDetail className="error">{error.message}</WalletDetail>
  ) : (
    !!overMax && (
      <WalletDetail className="warning">
        Selling {overMax.toFixed(4)} {selectedToken.symbol} over your current balance
      </WalletDetail>
    )
  )

  function useMax(): void {
    setValue(inputId, formatAmountFull(balance.exchangeBalance, balance.decimals, false))
  }

  return (
    <Wrapper>
      <TokenImgWrapper alt={selectedToken.name} src={selectedToken.image} />
      <SelectBox>
        <label>{selectLabel}</label>
        <Select
          isSearchable
          isDisabled={isDisabled}
          styles={customSelectStyles}
          noOptionsMessage={(): string => 'No results'}
          formatOptionLabel={formatOptionLabel}
          options={options}
          value={{ token: selectedToken }}
          onChange={(selected, { action }): void => {
            if (action === 'select-option' && 'token' in selected) {
              onSelectChange(selected.token)
            }
          }}
        />
      </SelectBox>
      <InputBox>
        <input
          className={className}
          placeholder="0"
          name={inputId}
          type="text"
          disabled={isDisabled}
          required
          ref={register({
            validate: {
              positive: (value: string): true | string => validatePositive(value),
            },
          })}
        />
        {errorOrWarning}
        <WalletDetail>
          <div>
            <strong>
              <Link to="/deposit">Exchange wallet:</Link>
            </strong>{' '}
            <span className="success">{displayBalance(balance, 'exchangeBalance')}</span>
          </div>
          {validateMaxAmount && <a onClick={useMax}>use max</a>}
        </WalletDetail>
        <WalletDetail>
          <div>
            <strong>Wallet:</strong> {displayBalance(balance, 'walletBalance')}
          </div>
        </WalletDetail>
      </InputBox>
    </Wrapper>
  )
}

export default TokenRow

import React, { CSSProperties, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import Select from 'react-select'
import { FormatOptionLabelContext } from 'react-select/src/Select'
import { useFormContext } from 'react-hook-form'

import TokenImg from 'components/TokenImg'
import { TokenDetails, TokenBalanceDetails } from 'types'
import { formatAmount } from 'utils'

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
  }
`

const WalletDetail = styled.div`
  font-size: 0.75em;

  .success {
    color: green;
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
  return formatAmount((balance || {}).exchangeBalance, token.decimals, 4, false) || '0'
}

// TODO: move into a validators file?
function validatePositive(value: string): true | string {
  return Number(value) > 0 || 'Invalid amount'
}

function validateMax(value: string, validateMaxAmount: boolean, max: string): true | string {
  return validateMaxAmount ? Number(value) <= Number(max) || 'Insufficient funds' : true
}

interface Props {
  token: TokenDetails
  tokens: TokenDetails[]
  balance: TokenBalanceDetails
  selectLabel: string
  onSelectChange: (selected: TokenDetails) => void
  inputId: string
  validateMaxAmount?: true
}

const TokenRow: React.FC<Props> = ({
  token,
  tokens,
  selectLabel,
  onSelectChange,
  balance,
  inputId,
  validateMaxAmount,
}) => {
  const options = useMemo(() => tokens.map(token => ({ token, value: token.symbol, label: token.name })), [tokens])

  const { register, errors, setValue } = useFormContext()

  const maxRef = useRef(getMax(balance, token))
  useEffect(() => {
    maxRef.current = getMax(balance, token)
  }, [balance, token])

  return (
    <Wrapper>
      <TokenImgWrapper alt={token.name} src={token.image} />
      <SelectBox>
        <label>{selectLabel}</label>
        <Select
          isSearchable
          styles={customSelectStyles}
          noOptionsMessage={(): string => 'No results'}
          formatOptionLabel={formatOptionLabel}
          options={options}
          value={{ token }}
          onChange={(selected, { action }): void => {
            if (action === 'select-option' && 'token' in selected) {
              onSelectChange(selected.token)
            }
          }}
        />
      </SelectBox>
      <InputBox>
        <input
          className={errors[inputId] && 'error'}
          placeholder="0"
          name={inputId}
          type="text"
          required
          ref={register({
            validate: {
              positive: (value: string): true | string => validatePositive(value),
              max: (value: string): true | string => validateMax(value, validateMaxAmount, maxRef.current),
            },
          })}
        />
        <WalletDetail>
          <strong>
            <Link to="/deposit">Exchange wallet:</Link>
          </strong>{' '}
          <a className="success" onClick={(): void => setValue(inputId, maxRef.current)}>
            {displayBalance(balance, 'exchangeBalance')}
          </a>
        </WalletDetail>
        <WalletDetail>
          <strong>Wallet:</strong> {displayBalance(balance, 'walletBalance')}
        </WalletDetail>
        {errors[inputId] && <WalletDetail className="error">{errors[inputId].message}</WalletDetail>}
      </InputBox>
    </Wrapper>
  )
}

export default TokenRow

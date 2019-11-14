import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { useFormContext } from 'react-hook-form'

import TokenImg from 'components/TokenImg'
import TokenSelector from 'components/TokenSelector'
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
      <TokenSelector
        label={selectLabel}
        isDisabled={isDisabled}
        tokens={tokens}
        selected={selectedToken}
        onChange={onSelectChange}
      />
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

import React, { useState } from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faCheck, faClock, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'

import { TokenBalanceDetails, Command } from 'types'
import { formatAmount, formatAmountFull } from 'utils'
import Form from './Form'
import { ZERO } from 'const'
import BN from 'bn.js'
import { log } from 'utils'
import TokenImg from 'components/TokenImg'

const TokenTr = styled.tr`

  &.highlight {
    background-color: #fdffc1;
    border-bottom-color: #fbdf8f;
  }

  &.loading {
    background-color: #f7f7f7;
    border-bottom-color: #b9b9b9;
  }

  &.selected {
    background-color: #ecdcff;
`

const ClaimButton = styled.button`
  margin-bottom: 0;
`

const ClaimLink = styled.a`
  text-decoration: none;

  &.success {
    color: #63ab52;
  }
  &.disabled {
    color: currentColor;
    cursor: not-allowed;
    opacity: 0.5;
  }
`

export interface RowProps {
  tokenBalances: TokenBalanceDetails
  onSubmitDeposit: (amount: BN) => Promise<void>
  onSubmitWithdraw: (amount: BN) => Promise<void>
  onClaim: Command
  onEnableToken: Command
}

export const Row: React.FC<RowProps> = (props: RowProps) => {
  const { tokenBalances, onSubmitDeposit, onSubmitWithdraw, onClaim, onEnableToken } = props
  const {
    address,
    addressMainnet,
    name,
    image,
    symbol,
    decimals,
    exchangeBalance,
    depositingBalance,
    withdrawingBalance,
    claimable,
    walletBalance,
    enabled,
    highlighted,
    enabling,
    claiming,
  } = tokenBalances
  log('[DepositWidgetRow] %s: %s', symbol, formatAmount(exchangeBalance, decimals))
  const [visibleForm, showForm] = useState<'deposit' | 'withdraw' | void>()
  const exchangeBalanceTotal = exchangeBalance.add(depositingBalance)

  let className
  if (highlighted) {
    className = 'highlight'
  } else if (enabling) {
    className = 'enabling'
  } else if (visibleForm) {
    className = 'selected'
  }

  const isDepositFormVisible = visibleForm == 'deposit'
  const isWithdrawFormVisible = visibleForm == 'withdraw'

  return (
    <>
      <TokenTr data-address={address} className={className} data-address-mainnet={addressMainnet}>
        <td>
          <TokenImg src={image} alt={name} />
        </td>
        <td>{name}</td>
        <td title={formatAmountFull(exchangeBalanceTotal, decimals)}>{formatAmount(exchangeBalanceTotal, decimals)}</td>
        <td title={formatAmountFull(withdrawingBalance, decimals)}>
          {claimable ? (
            <>
              <ClaimButton className="success" onClick={onClaim} disabled={claiming}>
                {claiming && <FontAwesomeIcon icon={faSpinner} spin />}
                &nbsp; {formatAmount(withdrawingBalance, decimals)}
              </ClaimButton>
              <div>
                <ClaimLink
                  className={claiming ? 'disabled' : 'success'}
                  onClick={(): void => {
                    if (!claiming) {
                      onClaim()
                    }
                  }}
                >
                  <small>Claim</small>
                </ClaimLink>
              </div>
            </>
          ) : withdrawingBalance.gt(ZERO) ? (
            <>
              <FontAwesomeIcon icon={faClock} />
              &nbsp; {formatAmount(withdrawingBalance, decimals)}
            </>
          ) : (
            0
          )}
        </td>
        <td title={formatAmountFull(walletBalance, decimals)}>{formatAmount(walletBalance, decimals)}</td>
        <td>
          {enabled ? (
            <>
              <button onClick={(): void => showForm('deposit')} disabled={isDepositFormVisible}>
                <FontAwesomeIcon icon={faPlus} />
                &nbsp; Deposit
              </button>
              <button onClick={(): void => showForm('withdraw')} disabled={isWithdrawFormVisible} className="danger">
                <FontAwesomeIcon icon={faMinus} />
                &nbsp; Withdraw
              </button>
            </>
          ) : (
            <button className="success" onClick={onEnableToken} disabled={enabling}>
              {enabling ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  &nbsp; Enabling {symbol}
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheck} />
                  &nbsp; Enable {symbol}
                </>
              )}
            </button>
          )}
        </td>
      </TokenTr>
      {isDepositFormVisible && (
        <Form
          title={
            <>
              Deposit <span className="symbol">{symbol}</span> in Exchange Wallet
            </>
          }
          totalAmountLabel="Wallet balance"
          totalAmount={walletBalance}
          inputLabel="Deposit amount"
          tokenBalances={tokenBalances}
          submitBtnLabel="Deposit"
          submitBtnIcon={faPlus}
          onSubmit={onSubmitDeposit}
          onClose={(): void => showForm()}
        />
      )}
      {isWithdrawFormVisible && (
        <Form
          title={
            <>
              Withdraw <span className="symbol">{symbol}</span> from Exchange Wallet
            </>
          }
          totalAmountLabel="Exchange wallet"
          totalAmount={exchangeBalanceTotal}
          inputLabel="Withdraw amount"
          tokenBalances={tokenBalances}
          submitBtnLabel="Withdraw"
          submitBtnIcon={faMinus}
          onSubmit={onSubmitWithdraw}
          onClose={(): void => showForm()}
        />
      )}
    </>
  )
}

export default Row

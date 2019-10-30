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

const TokenDiv = styled.div`
  display: grid;
  grid-template-columns: 1.1fr repeat(4, 1fr);
  align-items: center;
  justify-content: center;

  border-bottom: 2px solid #0000000f;
  border-radius: 20px;
  margin: 0.3rem 0;

  transition: background 0.1s ease-in-out;

  &:hover {
    background: #0000000f !important;
  }

  > div {
    margin: 0.1rem;
    padding: 0.7rem;
    text-align: center;
    transition: all 0.5s ease;

    &:first-child {
      display: flex;
      flex-flow: row wrap;
      justify-content: space-evenly;
      align-items: center;
      > * {
        margin: 5px;
      }
    }

    &:last-child {
      display: flex;
      flex-flow: column;
    }
  }

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
  }

  // &:nth-child(odd) {
  //   background: #8080801c;
  // }

  @media screen and (max-width: 500px) {
    grid-template-columns: none;
    grid-template-rows: auto;

    align-items: center;
    justify-content: stretch;
    padding: 0 0.7rem;

    box-shadow: 1px 6px 7px 0px #0000002e;

    > div {
      display: flex;
      flex-flow: row;
      align-items: center;
      border-bottom: 1px solid #00000024;

      > * {
        margin-left: 10px;
      }
      &:first-child {
        > img {
          order: 2;
          margin-right: -8px;
        }
      }
      &:last-child {
        border: none;
        flex-flow: row nowrap;
        padding: 0.7rem 0 0.7rem 0.7rem;

        > button {
          margin: 0.2rem;
        }

        > button:last-child {
          border-radius: 0 20px 20px;
        }
      }

      &::before {
        /*
        * aria-label has no advantage, it won't be read inside a table
        content: attr(aria-label);
        */
        content: attr(data-label);
        margin-right: auto;
        font-weight: bold;
        text-transform: uppercase;
        font-size: 0.7rem;
      }
    }
  }
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
      <TokenDiv data-address={address} className={className} data-address-mainnet={addressMainnet}>
        <div data-label="Token">
          <TokenImg src={image} alt={name} />
          <div>{name}</div>
        </div>
        <div data-label="Exchange Wallet" title={formatAmountFull(exchangeBalanceTotal, decimals)}>
          {formatAmount(exchangeBalanceTotal, decimals)}
        </div>
        <div data-label="Pending Withdrawals" title={formatAmountFull(withdrawingBalance, decimals)}>
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
        </div>
        <div data-label="Wallet" title={formatAmountFull(walletBalance, decimals)}>
          {formatAmount(walletBalance, decimals)}
        </div>
        <div data-label="Actions">
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
        </div>
      </TokenDiv>
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

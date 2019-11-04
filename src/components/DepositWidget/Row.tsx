import React, { useState, useMemo } from 'react'
import styled from 'styled-components'
import BN from 'bn.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faCheck, faClock, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'

import Form from './Form'
import TokenImg from 'components/TokenImg'

import { ZERO } from 'const'
import { formatAmount, formatAmountFull, log } from 'utils'
import { TokenBalanceDetails, Command } from 'types'

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
    background: #0000000a !important;
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

  @media only screen and (max-width: 500px) {
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

  // Checks innerWidth
  let showResponsive = innerWidth < 500

  useMemo((): void => {
    const bodyClassList: string[] | DOMTokenList = (window && window.document.body.classList) || []
    const noScrollActive = Array.from(bodyClassList).find((className: string): boolean => className === 'noScroll')
    // if innerWidth > 500 && body has noScroll active - REMOVE it
    if (noScrollActive && !visibleForm && !showResponsive) {
      ;(bodyClassList as DOMTokenList).remove('noScroll')
    } else if (!noScrollActive && visibleForm && showResponsive) {
      ;(bodyClassList as DOMTokenList).add('noScroll')
    }
  }, [showResponsive, visibleForm])

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

  const _showHideForm = (type?: 'deposit' | 'withdraw' | null): void => {
    if (window && window.document && innerWidth < 500) {
      type ? window.document.body.classList.add('noScroll') : window.document.body.classList.remove('noScroll')
    }

    showForm(type)
  }

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
              <button onClick={(): void => _showHideForm('deposit')} disabled={isDepositFormVisible}>
                <FontAwesomeIcon icon={faPlus} />
                &nbsp; Deposit
              </button>
              <button
                onClick={(): void => _showHideForm('withdraw')}
                disabled={isWithdrawFormVisible}
                className="danger"
              >
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
          onClose={(): void => _showHideForm()}
          responsive={showResponsive}
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
          onClose={(): void => _showHideForm()}
          responsive={showResponsive}
        />
      )}
    </>
  )
}

export default Row

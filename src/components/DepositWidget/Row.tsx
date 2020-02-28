import React, { useState } from 'react'
import BN from 'bn.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faClock, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'
import minus from 'assets/img/minus.svg'
import plus from 'assets/img/plus.svg'

import Form from './Form'
import TokenImg from 'components/TokenImg'
import { TokenRow, RowClaimButton, RowClaimLink } from './Styled'

import useNoScroll from 'hooks/useNoScroll'

import { ZERO, MEDIA } from 'const'
import { formatAmount, formatAmountFull } from 'utils'
import { TokenBalanceDetails, Command } from 'types'
import { TokenLocalState } from 'reducers-actions'

export interface RowProps extends TokenLocalState {
  tokenBalances: TokenBalanceDetails
  onSubmitDeposit: (amount: BN) => Promise<void>
  onSubmitWithdraw: (amount: BN) => Promise<void>
  onClaim: Command
  onEnableToken: Command
  innerWidth?: number
  innerHeight?: number
}

export const Row: React.FC<RowProps> = (props: RowProps) => {
  const {
    tokenBalances,
    onSubmitDeposit,
    onSubmitWithdraw,
    onClaim,
    onEnableToken,
    innerWidth,
    highlighted,
    enabling,
    claiming,
  } = props

  const {
    address,
    addressMainnet,
    name,
    image,
    symbol,
    decimals,
    totalExchangeBalance,
    pendingWithdraw,
    claimable,
    walletBalance,
    enabled,
  } = tokenBalances

  const [visibleForm, showForm] = useState<'deposit' | 'withdraw' | void>()

  // Checks innerWidth
  const showResponsive = !!innerWidth && innerWidth < MEDIA.MOBILE_LARGE_PX
  useNoScroll(!!visibleForm && showResponsive)

  let className
  if (highlighted.has(address)) {
    className = 'highlight'
  } else if (enabling.has(address)) {
    className = 'enabling'
  } else if (visibleForm) {
    className = 'selected'
  }

  const isDepositFormVisible = visibleForm == 'deposit'
  const isWithdrawFormVisible = visibleForm == 'withdraw'

  return (
    <>
      <TokenRow data-address={address} className={className} data-address-mainnet={addressMainnet}>
        <td data-label="Token">
          <TokenImg src={image} alt={name} />
          <div>
            <b>{symbol}</b>
            {name}
          </div>
        </td>
        <td data-label="Exchange Wallet" title={formatAmountFull(totalExchangeBalance, decimals) || ''}>
          {formatAmount(totalExchangeBalance, decimals)}
        </td>
        <td data-label="Pending Withdrawals" title={formatAmountFull(pendingWithdraw.amount, decimals) || ''}>
          {claimable ? (
            <>
              <RowClaimButton className="success" onClick={onClaim} disabled={claiming.has(address)}>
                {claiming.has(address) && <FontAwesomeIcon icon={faSpinner} style={{ marginRight: 7 }} spin />}
                {formatAmount(pendingWithdraw.amount, decimals)}
                <div>
                  <RowClaimLink
                    className={claiming.has(address) ? 'disabled' : 'success'}
                    onClick={(): void => {
                      if (!claiming) {
                        onClaim()
                      }
                    }}
                  ></RowClaimLink>
                </div>
              </RowClaimButton>
            </>
          ) : pendingWithdraw.amount.gt(ZERO) ? (
            <>
              <FontAwesomeIcon icon={faClock} style={{ marginRight: 7 }} />
              {formatAmount(pendingWithdraw.amount, decimals)}
            </>
          ) : (
            0
          )}
        </td>
        <td data-label="Wallet" title={formatAmountFull(walletBalance, decimals) || ''}>
          {formatAmount(walletBalance, decimals)}
        </td>
        <td data-label="Actions">
          {enabled ? (
            <button
              type="button"
              className="withdrawToken"
              onClick={(): void => showForm('deposit')}
              disabled={isDepositFormVisible}
            >
              <img src={plus} />
            </button>
          ) : (
            <>
              <button type="button" className="enableToken" onClick={onEnableToken} disabled={enabling.has(address)}>
                {enabling.has(address) ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    Enabling {symbol}
                  </>
                ) : (
                  <>Enable {symbol}</>
                )}
              </button>
            </>
          )}
          {!totalExchangeBalance.isZero() && (
            <button
              type="button"
              onClick={(): void => showForm('withdraw')}
              disabled={isWithdrawFormVisible}
              className="depositToken"
            >
              <img src={minus} />
            </button>
          )}
        </td>
      </TokenRow>
      {isDepositFormVisible && (
        <Form
          title={
            <span>
              Deposit <strong>{symbol}</strong> in Exchange Wallet
            </span>
          }
          totalAmountLabel="wallet balance"
          totalAmount={walletBalance}
          inputLabel="Deposit amount"
          tokenBalances={tokenBalances}
          submitBtnLabel="Deposit"
          submitBtnIcon={faPlus}
          onSubmit={onSubmitDeposit}
          onClose={(): void => showForm()}
          responsive={showResponsive}
        />
      )}
      {isWithdrawFormVisible && (
        <Form
          title={
            <span>
              Withdraw <strong>{symbol}</strong> from Exchange Wallet
            </span>
          }
          totalAmountLabel="Exchange wallet"
          totalAmount={totalExchangeBalance}
          inputLabel="Withdraw amount"
          tokenBalances={tokenBalances}
          submitBtnLabel="Withdraw"
          submitBtnIcon={faMinus}
          onSubmit={onSubmitWithdraw}
          onClose={(): void => showForm()}
          responsive={showResponsive}
        />
      )}
    </>
  )
}

export default Row

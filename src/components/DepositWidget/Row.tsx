import React, { useState } from 'react'
import BN from 'bn.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faCheck, faClock, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'

import Form from './Form'
import TokenImg from 'components/TokenImg'
import { TokenRow, RowClaimButton, RowClaimLink } from './Styled'

import useNoScroll from 'hooks/useNoScroll'

import { ZERO, RESPONSIVE_SIZES } from 'const'
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
  const showResponsive = !!innerWidth && innerWidth < RESPONSIVE_SIZES.MOBILE_LARGE_PX
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
          <div>{name}</div>
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
              </RowClaimButton>
              <div>
                <RowClaimLink
                  className={claiming.has(address) ? 'disabled' : 'success'}
                  onClick={(): void => {
                    if (!claiming) {
                      onClaim()
                    }
                  }}
                >
                  <small>Claim</small>
                </RowClaimLink>
              </div>
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
            <button onClick={(): void => showForm('deposit')} disabled={isDepositFormVisible}>
              <FontAwesomeIcon icon={faPlus} />
              &nbsp; Deposit
            </button>
          ) : (
            <>
              <button className="success" onClick={onEnableToken} disabled={enabling.has(address)}>
                {enabling.has(address) ? (
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
            </>
          )}
          {!totalExchangeBalance.isZero() && (
            <button onClick={(): void => showForm('withdraw')} disabled={isWithdrawFormVisible} className="danger">
              <FontAwesomeIcon icon={faMinus} />
              &nbsp; Withdraw
            </button>
          )}
        </td>
      </TokenRow>
      {isDepositFormVisible && (
        <Form
          title={
            <p>
              Deposit <strong>{symbol}</strong> in Exchange Wallet
            </p>
          }
          totalAmountLabel="Wallet balance"
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
            <p>
              Withdraw <strong>{symbol}</strong> from Exchange Wallet
            </p>
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

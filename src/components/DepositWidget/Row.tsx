import React, { useState } from 'react'
import BN from 'bn.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faClock, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'
import { MinusSVG, PlusSVG } from 'assets/img/SVG'

import Form from './Form'
import TokenImg from 'components/TokenImg'
import { TokenRow, RowClaimButton, RowClaimSpan } from './Styled'

import useNoScroll from 'hooks/useNoScroll'

import { ZERO, MEDIA, WETH_ADDRESS_MAINNET } from 'const'
import { formatAmount, formatAmountFull } from 'utils'
import { TokenBalanceDetails, Command } from 'types'
import { TokenLocalState } from 'reducers-actions'
import { WrapEtherBtn, UnwrapEtherBtn } from 'components/WrapEtherBtn'

export interface RowProps extends Record<keyof TokenLocalState, boolean> {
  tokenBalances: TokenBalanceDetails
  onSubmitDeposit: (amount: BN, onTxHash: (hash: string) => void) => Promise<void>
  onSubmitWithdraw: (amount: BN, onTxHash: (hash: string) => void) => Promise<void>
  onClaim: Command
  onEnableToken: Command
  innerWidth?: number
  innerHeight?: number
}

const spinner = <FontAwesomeIcon icon={faSpinner} style={{ marginRight: 7 }} spin />

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
    enabled,
    claiming,
    withdrawing,
    depositing,
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
    enabled: tokenEnabled,
  } = tokenBalances

  const [visibleForm, showForm] = useState<'deposit' | 'withdraw' | void>()

  // Checks innerWidth
  const showResponsive = !!innerWidth && innerWidth < MEDIA.MOBILE_LARGE_PX
  useNoScroll(!!visibleForm && showResponsive)

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
  const isWeth = addressMainnet === WETH_ADDRESS_MAINNET

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
        <td
          data-label="Exchange Wallet"
          title={formatAmountFull({ amount: totalExchangeBalance, precision: decimals }) || ''}
        >
          {depositing && spinner}
          {formatAmount(totalExchangeBalance, decimals)}
        </td>
        <td
          data-label="Pending Withdrawals"
          title={formatAmountFull({ amount: pendingWithdraw.amount, precision: decimals }) || ''}
        >
          {claimable ? (
            <>
              <RowClaimButton className="success" onClick={onClaim} disabled={claiming}>
                {(claiming || withdrawing) && spinner}
                {formatAmount(pendingWithdraw.amount, decimals)}
                <RowClaimSpan className={claiming || withdrawing ? 'disabled' : 'success'}>Claim</RowClaimSpan>
              </RowClaimButton>
            </>
          ) : pendingWithdraw.amount.gt(ZERO) ? (
            <>
              {withdrawing && spinner}
              <FontAwesomeIcon icon={faClock} style={{ marginRight: 7 }} />
              {formatAmount(pendingWithdraw.amount, decimals)}
            </>
          ) : (
            <>{withdrawing && spinner}0</>
          )}
        </td>
        <td data-label="Wallet" title={formatAmountFull({ amount: walletBalance, precision: decimals }) || ''}>
          {isWeth ? (
            <ul>
              <li className="not-implemented">
                0.1 ETH <WrapEtherBtn label="Wrap" className="wrapUnwrapEther" />
              </li>
              <li>
                {(claiming || depositing) && spinner}
                {formatAmount(walletBalance, decimals) + ' '}
                WETH <UnwrapEtherBtn label="Unwrap" className="wrapUnwrapEther" />
              </li>
            </ul>
          ) : (
            <>
              {(claiming || depositing) && spinner}
              {formatAmount(walletBalance, decimals)}
            </>
          )}
        </td>
        <td data-label="Actions">
          {enabled || tokenEnabled ? (
            <button
              type="button"
              className="withdrawToken"
              onClick={(): void => showForm('deposit')}
              disabled={isDepositFormVisible}
            >
              <PlusSVG />
            </button>
          ) : (
            <>
              <button type="button" className="enableToken" onClick={onEnableToken} disabled={enabling}>
                {enabling ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    Enabling
                  </>
                ) : (
                  <>Enable Deposit</>
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
              <MinusSVG />
            </button>
          )}
        </td>
      </TokenRow>
      {isDepositFormVisible && (
        <Form
          title={
            <span>
              Deposit <strong>{symbol}</strong> in the Exchange Wallet
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
              Withdraw <strong>{symbol}</strong> from the Exchange Wallet
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

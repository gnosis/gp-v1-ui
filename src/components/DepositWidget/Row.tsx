import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faCheck, faClock, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'
import { toast } from 'react-toastify'

import { TokenBalanceDetails, Receipt, TxOptionalParams } from 'types'
import unknownTokenImg from 'img/unknown-token.png'
import { formatAmount, formatAmountFull, abbreviateString } from 'utils'
import { useEnableTokens } from 'hooks/useEnableToken'
import Form from './Form'
import { useWithdrawTokens } from 'hooks/useWithdrawTokens'
import { ZERO } from 'const'
import BN from 'bn.js'
import { walletApi, depositApi } from 'api'
import { useHighlight } from 'hooks/useHighlight'

const TokenTr = styled.tr`
  img {
    width: 30px;
    height: 30px;
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
}

function _loadFallbackTokenImage(event: React.SyntheticEvent<HTMLImageElement>): void {
  const image = event.currentTarget
  image.src = unknownTokenImg
}

const txOptionalParams: TxOptionalParams = {
  onSentTransaction: (receipt: Receipt): void => {
    toast.info(
      <div>
        The transaction has been sent! Check{' '}
        <a href={`https://etherscan.io/tx/${receipt.transactionHash}`} target="_blank" rel="noopener noreferrer">
          {abbreviateString(receipt.transactionHash, 6, 4)}
        </a>{' '}
        for details
      </div>,
    )
  },
}

export const Row: React.FC<RowProps> = (props: RowProps) => {
  const [tokenBalances, setTokenBalances] = useState<TokenBalanceDetails>(props.tokenBalances)
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
  } = tokenBalances
  const [visibleForm, showForm] = useState<'deposit' | 'withdraw' | void>()
  const { enabled, enabling, enableToken } = useEnableTokens({
    tokenBalances,
    txOptionalParams,
  })
  const { withdrawing, withdraw } = useWithdrawTokens({
    tokenBalances,
    txOptionalParams,
  })
  const { highlight, triggerHighlight } = useHighlight()
  const mounted = useRef(true)

  useEffect(() => {
    return function cleanUp(): void {
      mounted.current = false
    }
  }, [])

  async function _enableToken(): Promise<void> {
    try {
      const result = await enableToken()
      console.log(`The transaction has been mined: ${result.receipt.transactionHash}`)

      triggerHighlight()

      toast.success(`The token ${symbol} has been enabled for trading`)
    } catch (error) {
      console.error('Error enabling the token', error)
      toast.error('Error enabling the token')
    }
  }

  async function _withdraw(): Promise<void> {
    try {
      console.debug(`Starting the withdraw for ${formatAmountFull(withdrawingBalance, decimals)} of ${symbol}`)

      const result = await withdraw()

      if (mounted.current) {
        setTokenBalances(
          (current: TokenBalanceDetails): TokenBalanceDetails => {
            return {
              ...current,
              exchangeBalance: current.exchangeBalance.sub(withdrawingBalance),
              withdrawingBalance: ZERO,
              claimable: false,
              walletBalance: current.walletBalance.add(withdrawingBalance),
            }
          },
        )
      }

      triggerHighlight()

      console.log(`The transaction has been mined: ${result.receipt.transactionHash}`)

      toast.success(`Withdraw of ${withdrawingBalance} ${symbol} completed`)
    } catch (error) {
      console.error('Error executing the withdraw request', error)
      toast.error(`Error executing the withdraw request: ${error.message}`)
    }
  }

  async function submitDeposit(amount: BN): Promise<void> {
    try {
      const userAddress = await walletApi.getAddress()
      console.log(`Processing deposit of ${amount} ${symbol} from ${userAddress}`)

      const result = await depositApi.deposit(userAddress, address, amount, txOptionalParams)
      console.log(`The transaction has been mined: ${result.receipt.transactionHash}`)

      if (mounted.current) {
        setTokenBalances(
          (current: TokenBalanceDetails): TokenBalanceDetails => {
            return {
              ...current,
              depositingBalance: current.depositingBalance.add(amount),
              walletBalance: current.walletBalance.sub(amount),
            }
          },
        )
      }
      triggerHighlight()

      toast.success(`Successfully deposited ${formatAmount(amount, decimals)} ${symbol}`)
    } catch (error) {
      console.error('Error depositing', error)
      toast.error(`Error depositing: ${error.message}`)
    }
  }

  async function submitWithdraw(amount: BN): Promise<void> {
    try {
      const userAddress = await walletApi.getAddress()
      console.log(`Processing withdraw request of ${amount} ${symbol} from ${userAddress}`)

      const result = await depositApi.requestWithdraw(userAddress, address, amount, txOptionalParams)
      console.log(`The transaction has been mined: ${result.receipt.transactionHash}`)

      if (mounted.current) {
        setTokenBalances(
          (current: TokenBalanceDetails): TokenBalanceDetails => {
            return {
              ...current,
              withdrawingBalance: amount,
              claimable: false,
            }
          },
        )
      }
      triggerHighlight()

      toast.success(`Successfully requested withdraw of ${formatAmount(amount, decimals)} ${symbol}`)
    } catch (error) {
      console.error('Error requesting withdraw', error)
      toast.error(`Error requesting withdraw: ${error.message}`)
    }
  }
  const exchangeBalanceTotal = exchangeBalance.add(depositingBalance)

  let className
  if (highlight) {
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
          <img src={image} alt={name} onError={_loadFallbackTokenImage} />
        </td>
        <td>{name}</td>
        <td title={formatAmountFull(exchangeBalanceTotal, decimals)}>{formatAmount(exchangeBalanceTotal, decimals)}</td>
        <td title={formatAmountFull(withdrawingBalance, decimals)}>
          {claimable ? (
            <>
              <ClaimButton className="success" onClick={_withdraw} disabled={withdrawing}>
                {withdrawing && <FontAwesomeIcon icon={faSpinner} spin />}
                &nbsp; {formatAmount(withdrawingBalance, decimals)}
              </ClaimButton>
              <div>
                <ClaimLink
                  className={withdrawing ? 'disabled' : 'success'}
                  onClick={(): void => {
                    if (!withdrawing) {
                      _withdraw()
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
            <button className="success" onClick={_enableToken} disabled={enabling}>
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
          onSubmit={submitDeposit}
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
          onSubmit={submitWithdraw}
          onClose={(): void => showForm()}
        />
      )}
    </>
  )
}

export default Row

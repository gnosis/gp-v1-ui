import React, { useState } from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faCheck } from '@fortawesome/free-solid-svg-icons'
import { toast } from 'react-toastify'

import { TokenBalanceDetails, Receipt } from 'types'
import unknownTokenImg from 'img/unknown-token.png'
import { formatAmount, formatAmountFull } from 'utils'
import { useEnableTokens } from 'hooks/useEnableToken'

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
    // border-bottom-color: #b9b9b9;
  }
`

const FormTr = styled.tr`
  background-color: #f7f0ff;

  .close-form {
    margin-top: 3em;
  }

  a {
    text-decoration: underline;
  }
`

export interface RowProps {
  tokenBalances: TokenBalanceDetails
}

function _loadFallbackTokenImage(event: React.FormEvent<HTMLImageElement>): void {
  const image = event.target as HTMLImageElement
  image.src = unknownTokenImg
}

export const Row: React.FC<RowProps> = ({ tokenBalances }: RowProps) => {
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
    walletBalance,
  } = tokenBalances
  const [visibleForm, showForm] = useState<'deposit' | 'withdraw'>(undefined)
  const { enabled, enabling, highlight, enableToken } = useEnableTokens({
    tokenBalances,
    txOptionalParams: {
      onSentTransaction: (receipt: Receipt): void => {
        toast.info(
          <div>
            The transaction has been sent! Check{' '}
            <a href={`https://etherscan.io/tx/${receipt.transactionHash}`} target="_blank" rel="noopener noreferrer">
              {receipt.transactionHash.slice(0, 10)}...
            </a>{' '}
            for details
          </div>,
        )
      },
    },
  })

  async function _enableToken(): Promise<void> {
    try {
      const result = await enableToken()
      console.log(`The transaction has been mined: ${result.receipt.transactionHash}`)

      toast.success(`The token ${symbol} has been enabled for trading`)
    } catch (error) {
      console.error('Error enabling the token', error)
      toast.error('Error enabling the token')
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
        <td title={formatAmountFull(withdrawingBalance, decimals)}>{formatAmount(withdrawingBalance, decimals)}</td>
        <td title={formatAmountFull(walletBalance, decimals)}>{formatAmount(walletBalance, decimals)}</td>
        <td>
          {enabled ? (
            <>
              <button onClick={(): void => showForm('deposit')} disabled={isDepositFormVisible}>
                + Deposit
              </button>
              <button onClick={(): void => showForm('withdraw')} disabled={isWithdrawFormVisible} className="danger">
                - Withdraw
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
        <FormTr>
          <td colSpan={6}>
            <h4>
              Deposit {name} ({symbol}) into Exchange Wallet
            </h4>
            <ul>
              <li>
                <label>Wallet balance</label>
                <div>
                  12345 (<a onClick={(): void => alert('use MAX')}>MAX</a>)
                </div>
              </li>
              <li>
                <label>Deposit amount</label>
                <input type="text" placeholder="Amount" />
              </li>
            </ul>
            <div className="close-form">
              (&nbsp;<a onClick={(): void => showForm(undefined)}>Close</a>&nbsp;)
            </div>
          </td>
        </FormTr>
      )}
      {isWithdrawFormVisible && (
        <FormTr>
          <td colSpan={6}>Withdraw form</td>
        </FormTr>
      )}
    </>
  )
}

export default Row

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

  td {
    position: relative;
  }

  span.symbol {
    color: #b02ace;
  }

  h4 {
    margin: 0;
    font-size: 1.3em;
  }

  ul {
    align-items: center;
    list-style: none;
    text-align: left;

    li {
      display: block;
      margin: 0 auto;
      width: 25em;
    }

    li > label {
      width: 8em;
      color: #6c0084;
      font-weight: bold;
      text-align: right;
    }

    div.wallet {
      display: inline-block;
      text-align: center;
      position: relative;

      a.max {
        display: inline-block;
        margin-left: 0.5em;
        position: absolute;
        top: 1.3em;
        right: -3em;
      }
    }

    li > label {
      display: inline-block;
      height: 100%;
    }

    .buttons {
      text-align: center;
      button {
        width: 7em;
        margin-left: 1.2em;
      }
    }
  }

  .times {
    position: absolute;
    top: 0;
    right: 0;
    text-decoration: none;
    font-size: 2em;
    display: inline-block;
    padding: 0 0.5em 0 0;
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
  const [depositAmount, setDepositAmount] = useState('')

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
  const cancelForm = (): void => {
    showForm(undefined)
    setDepositAmount('')
  }

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
            <a className="times" onClick={cancelForm}>
              &times;
            </a>
            <h4>
              Deposit <span className="symbol">{symbol}</span> in Exchange Wallet
            </h4>
            <ul>
              <li>
                <label>Wallet balance</label>
                <div className="wallet">
                  <input type="text" value={formatAmountFull(walletBalance, decimals)} disabled />
                  <br />
                  <a
                    className="max"
                    onClick={(): void => setDepositAmount(formatAmountFull(walletBalance, decimals, false))}
                  >
                    <small>Use Max</small>
                  </a>
                </div>
              </li>
              <li>
                <label>Deposit amount</label>
                <input type="text" value={depositAmount} placeholder={symbol + ' amount'} />
              </li>
              <li className="buttons">
                <a onClick={cancelForm}>Cancel</a>
                <button type="button" className="success">
                  Deposit
                </button>
              </li>
            </ul>
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

import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'

import { Row } from './Row'
import { useTokenBalances } from 'hooks/useTokenBalances'
import ErrorMsg from 'components/ErrorMsg'
import { depositApi, erc20Api } from 'api'
import { EtherscanLink } from 'components/EtherscanLink'
import { toast } from 'react-toastify'
import BN from 'bn.js'
import { TxOptionalParams, Receipt, TokenBalanceDetails, Mutation } from 'types'
import { TxNotification } from 'components/TxNotification'
import { useWalletConnection } from 'hooks/useWalletConnection'
import { formatAmount, formatAmountFull } from 'utils'
import { log } from 'utils'
import { HIGHLIGHT_TIME, ZERO, ALLOWANCE_MAX_VALUE } from 'const'

const Wrapper = styled.section`
  font-size: 0.85rem;
  padding-bottom: 4em;
  // border-spacing: 0px;
  table {
    border-collapse: collapse;
  }

  tr {
    transition: all 0.5s ease;
  }

  td,
  th {
    text-align: center;
  }

  th {
    color: #000000;
    line-height: 1.5;
    font-size: 0.8em;
    text-transform: uppercase;
    overflow-wrap: break-word;
    padding: 0.5em;
    font-weight: 800;
  }

  tr td:last-child {
    width: 18em;
    text-align: center;
  }

  td {
    padding: 1em 0.5em;
  }

  tr {
    border-bottom: 1px solid #f2f2f2;
  }

  tr:last-child {
    border-bottom: none;
  }
`

const LinkWrapper = styled.div`
  a {
    text-align: right;
    margin-bottom: 3em;
    display: block;
  }
`

const txOptionalParams: TxOptionalParams = {
  onSentTransaction: (receipt: Receipt): void => {
    const notification = <TxNotification txHash={receipt.transactionHash} />
    if (notification) {
      toast.info(notification)
    } else {
      console.error(`Failed to get notification for tx ${receipt.transactionHash}`)
    }
  },
}

const DepositWidget: React.FC = () => {
  const { userAddress } = useWalletConnection()
  const { balances, setBalances, error } = useTokenBalances()
  // const { highlight, triggerHighlight } = useHighlight()

  const contractAddress = depositApi.getContractAddress()
  const mounted = useRef(true)
  useEffect(() => {
    return function cleanUp(): void {
      mounted.current = false
    }
  }, [])

  if (balances === undefined) {
    // Loading: Do not show the widget
    return <></>
  }
  const contractLink = (
    <EtherscanLink type="contract" identifier={contractAddress} label={<small>View verified contract</small>} />
  )

  function _getToken(tokenAddress: string): TokenBalanceDetails {
    return balances.find(({ address }) => address === tokenAddress)
  }

  function _updateToken(tokenAddress: string, updateBalances: Mutation<TokenBalanceDetails>): void {
    setBalances(balances =>
      balances.map(tokenBalancesAux => {
        const { address: tokenAddressAux } = tokenBalancesAux
        return tokenAddressAux === tokenAddress ? updateBalances(tokenBalancesAux) : tokenBalancesAux
      }),
    )
  }

  function _clearHighlight(tokenAddress: string): void {
    setTimeout(() => {
      _updateToken(tokenAddress, tokenBalancesAux => ({
        ...tokenBalancesAux,
        highlighted: false,
      }))
    }, HIGHLIGHT_TIME)
  }

  async function _deposit(amount: BN, tokenAddress: string): Promise<void> {
    try {
      const { symbol, decimals } = _getToken(tokenAddress)
      log(`Processing deposit of ${amount} ${symbol} from ${userAddress}`)
      const result = await depositApi.deposit(userAddress, tokenAddress, amount, txOptionalParams)
      log(`The transaction has been mined: ${result.receipt.transactionHash}`)

      if (mounted.current) {
        _updateToken(tokenAddress, ({ depositingBalance, walletBalance, ...otherParams }) => {
          return {
            ...otherParams,
            depositingBalance: depositingBalance.add(amount),
            walletBalance: walletBalance.sub(amount),
            highlighted: true,
          }
        })
        _clearHighlight(tokenAddress)
      }

      toast.success(`Successfully deposited ${formatAmount(amount, decimals)} ${symbol}`)
    } catch (error) {
      console.error('Error depositing', error)
      toast.error(`Error depositing: ${error.message}`)
    }
  }

  async function _requestWithdraw(amount: BN, tokenAddress: string): Promise<void> {
    const { symbol, decimals } = _getToken(tokenAddress)
    try {
      log(`Processing withdraw request of ${amount} ${symbol} from ${userAddress}`)

      const result = await depositApi.requestWithdraw(userAddress, tokenAddress, amount, txOptionalParams)
      log(`The transaction has been mined: ${result.receipt.transactionHash}`)

      if (mounted.current) {
        _updateToken(tokenAddress, otherParams => {
          return {
            ...otherParams,
            withdrawingBalance: amount,
            claimable: false,
            highlighted: true,
          }
        })
        _clearHighlight(tokenAddress)
      }

      toast.success(`Successfully requested withdraw of ${formatAmount(amount, decimals)} ${symbol}`)
    } catch (error) {
      console.error('Error requesting withdraw', error)
      toast.error(`Error requesting withdraw: ${error.message}`)
    }
  }

  async function _claim(tokenAddress: string): Promise<void> {
    const { withdrawingBalance, symbol, decimals } = _getToken(tokenAddress)
    try {
      console.debug(`Starting the withdraw for ${formatAmountFull(withdrawingBalance, decimals)} of ${symbol}`)
      const result = await depositApi.withdraw(userAddress, tokenAddress, txOptionalParams)

      if (mounted.current) {
        _updateToken(tokenAddress, ({ exchangeBalance, walletBalance, ...otherParams }) => {
          return {
            ...otherParams,
            exchangeBalance: exchangeBalance.sub(withdrawingBalance),
            withdrawingBalance: ZERO,
            claimable: false,
            walletBalance: walletBalance.add(withdrawingBalance),
            withdrawing: true,
            highlighted: true,
          }
        })
        _clearHighlight(tokenAddress)
      }

      log(`The transaction has been mined: ${result.receipt.transactionHash}`)
      toast.success(`Withdraw of ${withdrawingBalance} ${symbol} completed`)
    } catch (error) {
      console.error('Error executing the withdraw request', error)
      toast.error(`Error executing the withdraw request: ${error.message}`)
    }
  }

  async function _enableToken(tokenAddress: string): Promise<void> {
    const { symbol } = _getToken(tokenAddress)
    try {
      const result = await erc20Api.approve(
        tokenAddress,
        userAddress,
        contractAddress,
        ALLOWANCE_MAX_VALUE,
        txOptionalParams,
      )
      log(`The transaction has been mined: ${result.receipt.transactionHash}`)

      if (mounted.current) {
        _updateToken(tokenAddress, otherParams => {
          return {
            ...otherParams,
            enabled: true,
            highlighted: true,
          }
        })
        _clearHighlight(tokenAddress)
      }

      toast.success(`The token ${symbol} has been enabled for trading`)
    } catch (error) {
      console.error('Error enabling the token', error)
      toast.error('Error enabling the token')
    }
  }

  return (
    <Wrapper className="widget">
      {contractLink && <LinkWrapper>{contractLink}</LinkWrapper>}
      {error ? (
        <ErrorMsg title="oops..." message="Something happened while loading the balances" />
      ) : (
        <table>
          <thead>
            <tr>
              <th colSpan={2}>Token</th>
              <th>
                Exchange
                <br />
                wallet
              </th>
              <th>
                Pending
                <br />
                withdrawals
              </th>
              <th>Wallet</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {balances &&
              balances.map(tokenBalances => (
                <Row
                  key={tokenBalances.addressMainnet}
                  tokenBalances={tokenBalances}
                  onEnableToken={(): Promise<void> => _enableToken(tokenBalances.address)}
                  onSubmitDeposit={(balance): Promise<void> => _deposit(balance, tokenBalances.address)}
                  onSubmitWithdraw={(balance): Promise<void> => _requestWithdraw(balance, tokenBalances.address)}
                  onClaim={(): Promise<void> => _claim(tokenBalances.address)}
                />
              ))}
          </tbody>
        </table>
      )}
    </Wrapper>
  )
}

export default DepositWidget

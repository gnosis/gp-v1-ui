import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'

import { Row } from './Row'
import { useTokenBalances } from 'hooks/useTokenBalances'
import ErrorMsg from 'components/ErrorMsg'
import { depositApi } from 'api'
import { EtherscanLink } from 'components/EtherscanLink'
import { toast } from 'react-toastify'
import BN from 'bn.js'
import { TxOptionalParams, Receipt, TokenBalanceDetails } from 'types'
import { TxNotification } from 'components/TxNotification'
import { useWalletConnection } from 'hooks/useWalletConnection'
import { formatAmount, formatAmountFull } from 'utils'
import { log } from 'utils'

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

  async function _deposit(amount: BN, tokenBalances: TokenBalanceDetails): Promise<void> {
    try {
      const { address: tokenAddress, symbol, decimals } = tokenBalances
      log(`Processing deposit of ${amount} ${symbol} from ${userAddress}`)
      const result = await depositApi.deposit(userAddress, tokenAddress, amount, txOptionalParams)
      log(`The transaction has been mined: ${result.receipt.transactionHash}`)

      if (mounted.current) {
        setBalances(balances =>
          balances.map(tokenBalancesAux => {
            const { address: tokenAddressAux, depositingBalance, walletBalance } = tokenBalancesAux
            if (tokenAddressAux === tokenAddress) {
              return {
                ...tokenBalances,
                depositingBalance: depositingBalance.add(amount),
                walletBalance: walletBalance.sub(amount),
              }
            } else {
              return tokenBalancesAux
            }
          }),
        )
      }

      // TODO: Trigger hightlight
      // triggerHighlight()

      toast.success(`Successfully deposited ${formatAmount(amount, decimals)} ${symbol}`)
    } catch (error) {
      console.error('Error depositing', error)
      toast.error(`Error depositing: ${error.message}`)
    }
  }

  async function _requestWithdraw(amount: BN, tokenBalances: TokenBalanceDetails): Promise<void> {
    const { address: tokenAddress, symbol, decimals } = tokenBalances
    try {
      log(`Processing withdraw request of ${amount} ${symbol} from ${userAddress}`)

      const result = await depositApi.requestWithdraw(userAddress, tokenAddress, amount, txOptionalParams)
      log(`The transaction has been mined: ${result.receipt.transactionHash}`)

      if (mounted.current) {
        // TODO:
        log('_requestWithdraw', formatAmount(amount, decimals), tokenBalances)
        // setTokenBalances(
        //   (current: TokenBalanceDetails): TokenBalanceDetails => {
        //     return {
        //       ...current,
        //       withdrawingBalance: amount,
        //       claimable: false,
        //     }
        //   },
        // )
      }
      // TODO: Trigger hightlight
      // triggerHighlight()

      toast.success(`Successfully requested withdraw of ${formatAmount(amount, decimals)} ${symbol}`)
    } catch (error) {
      console.error('Error requesting withdraw', error)
      toast.error(`Error requesting withdraw: ${error.message}`)
    }
  }

  async function _claim(tokenBalances: TokenBalanceDetails): Promise<void> {
    const { withdrawingBalance, symbol, decimals } = tokenBalances
    try {
      console.debug(`Starting the withdraw for ${formatAmountFull(withdrawingBalance, decimals)} of ${symbol}`)

      // const result = await withdraw()

      if (mounted.current) {
        // TODO:
        log('_claim', formatAmount(withdrawingBalance, decimals), tokenBalances)
        // setTokenBalances(
        //   (current: TokenBalanceDetails): TokenBalanceDetails => {
        //     return {
        //       ...current,
        //       exchangeBalance: current.exchangeBalance.sub(withdrawingBalance),
        //       withdrawingBalance: ZERO,
        //       claimable: false,
        //       walletBalance: current.walletBalance.add(withdrawingBalance),
        //     }
        //   },
        // )
      }

      // TODO: Trigger hightlight
      // triggerHighlight()

      log(`The transaction has been mined: ${result.receipt.transactionHash}`)

      toast.success(`Withdraw of ${withdrawingBalance} ${symbol} completed`)
    } catch (error) {
      console.error('Error executing the withdraw request', error)
      toast.error(`Error executing the withdraw request: ${error.message}`)
    }
  }

  async function _enableToken(tokenBalances: TokenBalanceDetails): Promise<void> {
    const { withdrawingBalance, symbol, decimals } = tokenBalances
    try {
      // TODO
      // const result = await enableToken()
      // log(`The transaction has been mined: ${result.receipt.transactionHash}`)
      log('_enableToken', tokenBalances)

      // TODO: Trigger hightlight
      // triggerHighlight()

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
                  onEnableToken={(): Promise<void> => _enableToken(tokenBalances)}
                  onSubmitDeposit={(balance): Promise<void> => _deposit(balance, tokenBalances)}
                  onSubmitWithdraw={(balance): Promise<void> => _requestWithdraw(balance, tokenBalances)}
                  onClaim={(): Promise<void> => _claim(tokenBalances)}
                />
              ))}
          </tbody>
        </table>
      )}
    </Wrapper>
  )
}

export default DepositWidget

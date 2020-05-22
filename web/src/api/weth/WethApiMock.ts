import { logDebug } from 'utils'
import { Receipt } from 'types'
import { waitAndSendReceipt } from 'utils/mock'
import { WethApi, WrapUnwrapParams } from './WethApi'

import { RECEIPT } from '../../../test/data'

// interface WethApiMockParams {
//   erc20ApiMock: Erc20ApiMock
// }

/**
 * Basic implementation of WETH API
 */
export class WethApiMock implements WethApi {
  // private _erc20ApiMock: Erc20ApiMock

  // public constructor() {
  //   console.log(params)
  //   // const { erc20ApiMock } = params
  //   // this._erc20ApiMock = erc20ApiMock
  // }

  async deposit(params: WrapUnwrapParams): Promise<Receipt> {
    const { networkId, amount, userAddress, txOptionalParams } = params

    await waitAndSendReceipt({ txOptionalParams })

    // // Update any unapplied deposit
    // this._updateDepositsBalance({ userAddress, tokenAddress, currentBatchId })

    // const pendingDeposits = balanceState.pendingDeposits
    // pendingDeposits.amount = pendingDeposits.amount.add(amount)
    // pendingDeposits.batchId = currentBatchId

    // // mock transfer tokens from user's mock `wallet`
    // await this._erc20Api.transferFrom({
    //   userAddress: this.getContractAddress(),
    //   tokenAddress,
    //   fromAddress: userAddress,
    //   toAddress: this.getContractAddress(),
    //   amount,
    //   networkId,
    // })

    logDebug(`[WethApi] Wrapped ${amount} ETH for user ${userAddress} in network ${networkId}`)

    return RECEIPT
  }

  async withdraw(params: WrapUnwrapParams): Promise<Receipt> {
    const { networkId, amount, userAddress, txOptionalParams } = params

    await waitAndSendReceipt({ txOptionalParams })

    // // Update any unapplied deposit
    // this._updateDepositsBalance({ userAddress, tokenAddress, currentBatchId })

    // const pendingDeposits = balanceState.pendingDeposits
    // pendingDeposits.amount = pendingDeposits.amount.add(amount)
    // pendingDeposits.batchId = currentBatchId

    // // mock transfer tokens from user's mock `wallet`
    // await this._erc20Api.transferFrom({
    //   userAddress: this.getContractAddress(),
    //   tokenAddress,
    //   fromAddress: userAddress,
    //   toAddress: this.getContractAddress(),
    //   amount,
    //   networkId,
    // })

    logDebug(`[WethApi] Wrapped ${amount} ETH for user ${userAddress} in network ${networkId}`)
    return RECEIPT
  }
}

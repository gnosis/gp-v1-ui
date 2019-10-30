import { Erc20Api, TxOptionalParams, Receipt, ERC20 } from 'types'
import BN from 'bn.js'
import { ZERO } from 'const'
import { toBN } from 'utils'
import Erc20ABI from './Erc20ABI'

import Web3 from 'web3'

/**
 * Basic implementation of ERC20 API
 */
export class Erc20ApiImpl implements Erc20Api {
  private _ReferenceERC20: ERC20

  private static _contractsCache: { [K: string]: ERC20 } = {}

  public constructor(web3: Web3) {
    this._ReferenceERC20 = new web3.eth.Contract(Erc20ABI)

    // TODO remove later
    ;(window as any).erc20 = this._ReferenceERC20
  }

  public async balanceOf(tokenAddress: string, userAddress: string): Promise<BN> {
    if (!userAddress || !tokenAddress) return ZERO

    const erc20 = this._getERC20AtAddress(tokenAddress)

    const result = await erc20.methods.balanceOf(userAddress).call()

    return toBN(result)
  }

  public async allowance(tokenAddress: string, userAddress: string, spenderAddress: string): Promise<BN> {
    if (!userAddress || !tokenAddress) return ZERO

    const erc20 = this._getERC20AtAddress(tokenAddress)

    const result = await erc20.methods.allowance(userAddress, spenderAddress).call()

    return toBN(result)
  }

  public async approve(
    tokenAddress: string,
    userAddress: string,
    spenderAddress: string,
    amount: BN,
    txOptionalParams?: TxOptionalParams,
  ): Promise<Receipt> {
    const erc20 = this._getERC20AtAddress(tokenAddress)

    const tx = erc20.methods.approve(spenderAddress, amount).send({
      from: userAddress,
    })

    if (txOptionalParams && txOptionalParams.onSentTransaction) {
      tx.once('receipt', txOptionalParams.onSentTransaction)
    }

    return tx
  }

  public async transfer(
    tokenAddress: string,
    fromAddress: string,
    toAddress: string,
    amount: BN,
    txOptionalParams?: TxOptionalParams,
  ): Promise<Receipt> {
    const erc20 = this._getERC20AtAddress(tokenAddress)

    const tx = erc20.methods.transfer(toAddress, amount).send({
      from: fromAddress,
    })

    if (txOptionalParams) {
      tx.once('receipt', txOptionalParams.onSentTransaction)
    }

    return tx
  }

  public async transferFrom(
    senderAddress: string,
    tokenAddress: string,
    fromAddress: string,
    toAddress: string,
    amount: BN,
    txOptionalParams?: TxOptionalParams,
  ): Promise<Receipt> {
    const erc20 = this._getERC20AtAddress(tokenAddress)

    const tx = erc20.methods.transferFrom(senderAddress, toAddress, amount).send({
      from: fromAddress,
    })

    if (txOptionalParams) {
      tx.once('receipt', txOptionalParams.onSentTransaction)
    }

    return tx
  }

  /********************************    private methods   ********************************/

  private _getERC20AtAddress(address: string): ERC20 {
    const erc20 = Erc20ApiImpl._contractsCache[address]

    if (erc20) return erc20

    const newERC20 = this._ReferenceERC20.clone()
    newERC20.options.address = address

    return (Erc20ApiImpl._contractsCache[address] = newERC20)
  }
}

export default Erc20ApiImpl

import { Erc20Api, TxOptionalParams, Receipt } from 'types'
import { ERC20 } from 'types/ERC20'
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).erc20 = this._ReferenceERC20
  }

  public async balanceOf({ tokenAddress, userAddress }: { tokenAddress: string; userAddress: string }): Promise<BN> {
    if (!userAddress || !tokenAddress) return ZERO

    const erc20 = this._getERC20AtAddress(tokenAddress)

    const result = await erc20.methods.balanceOf(userAddress).call()

    return toBN(result)
  }

  public async name({ tokenAddress }: { tokenAddress: string }): Promise<string> {
    const erc20 = this._getERC20AtAddress(tokenAddress)

    return erc20.methods.name().call()
  }

  public async symbol({ tokenAddress }: { tokenAddress: string }): Promise<string> {
    const erc20 = this._getERC20AtAddress(tokenAddress)

    return erc20.methods.symbol().call()
  }

  public async decimals({ tokenAddress }: { tokenAddress: string }): Promise<number> {
    const erc20 = this._getERC20AtAddress(tokenAddress)

    const decimals = erc20.methods.decimals().call()

    return Number(decimals)
  }

  public async allowance({
    tokenAddress,
    userAddress,
    spenderAddress,
  }: {
    tokenAddress: string
    userAddress: string
    spenderAddress: string
  }): Promise<BN> {
    if (!userAddress || !tokenAddress) return ZERO

    const erc20 = this._getERC20AtAddress(tokenAddress)

    const result = await erc20.methods.allowance(userAddress, spenderAddress).call()

    return toBN(result)
  }

  public async approve(
    {
      userAddress,
      tokenAddress,
      spenderAddress,
      amount,
    }: { userAddress: string; tokenAddress: string; spenderAddress: string; amount: BN },
    txOptionalParams?: TxOptionalParams,
  ): Promise<Receipt> {
    const erc20 = this._getERC20AtAddress(tokenAddress)

    // TODO: Remove temporal fix for web3. See https://github.com/gnosis/dex-react/issues/231
    const tx = erc20.methods.approve(spenderAddress, amount.toString()).send({
      from: userAddress,
    })

    if (txOptionalParams?.onSentTransaction) {
      tx.once('transactionHash', txOptionalParams.onSentTransaction)
    }

    return tx
  }

  public async transfer(
    {
      fromAddress,
      tokenAddress,
      toAddress,
      amount,
    }: { fromAddress: string; tokenAddress: string; toAddress: string; amount: BN },
    txOptionalParams?: TxOptionalParams,
  ): Promise<Receipt> {
    const erc20 = this._getERC20AtAddress(tokenAddress)

    // TODO: Remove temporal fix for web3. See https://github.com/gnosis/dex-react/issues/231
    const tx = erc20.methods.transfer(toAddress, amount.toString()).send({
      from: fromAddress,
    })

    if (txOptionalParams?.onSentTransaction) {
      tx.once('transactionHash', txOptionalParams.onSentTransaction)
    }

    return tx
  }

  public async transferFrom(
    {
      senderAddress,
      tokenAddress,
      fromAddress,
      toAddress,
      amount,
    }: { senderAddress: string; tokenAddress: string; fromAddress: string; toAddress: string; amount: BN },
    txOptionalParams?: TxOptionalParams,
  ): Promise<Receipt> {
    const erc20 = this._getERC20AtAddress(tokenAddress)

    const tx = erc20.methods.transferFrom(senderAddress, toAddress, amount.toString()).send({
      from: fromAddress,
    })

    if (txOptionalParams?.onSentTransaction) {
      tx.once('transactionHash', txOptionalParams.onSentTransaction)
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

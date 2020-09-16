import Web3 from 'web3'

import { Network, WithTxOptionalParams, Receipt } from 'types'
import { WETH_ADDRESS_MAINNET, WETH_ADDRESS_RINKEBY } from 'const'
import { wethAbi } from '@gnosis.pm/dex-js'
import { logDebug } from 'utils'

import { WethContract } from '@gnosis.pm/dex-js/build-esm/contracts/WethContract'

export interface WrapUnwrapParams extends WithTxOptionalParams {
  networkId: number
  userAddress: string
  amount: string
}

/**
 * Interfaces for Wrapping ETH and unwrapping WETH token
 */
export interface WethApi {
  deposit(params: WrapUnwrapParams): Promise<Receipt>
  withdraw(params: WrapUnwrapParams): Promise<Receipt>
}

export interface WethApiDependencies {
  web3: Web3
}

function getWethAddressByNetwork(networkId: number): string {
  switch (networkId) {
    case Network.Mainnet:
      return WETH_ADDRESS_MAINNET
    case Network.Rinkeby:
      return WETH_ADDRESS_RINKEBY
    default:
      throw new Error(`WethApi was not deployed to network ${networkId}`)
  }
}

/**
 * Basic implementation of WETH API
 * Note that there's already another API for all ERC20, so only the deposit/withdraw is implemented in this API
 */
export class WethApiImpl implements WethApi {
  protected _contractPrototype: WethContract
  protected static _contractsCache: { [network: number]: { [address: string]: WethContract } } = {}
  private web3: Web3

  public constructor(injectedDependencies: WethApiDependencies) {
    Object.assign(this, injectedDependencies)
    this._contractPrototype = (new this.web3.eth.Contract(wethAbi) as unknown) as WethContract
  }

  public async deposit(params: WrapUnwrapParams): Promise<Receipt> {
    const { networkId, amount, userAddress, txOptionalParams } = params
    const contract = await this._getContract(networkId)

    logDebug('[WethApi] deposit:', { from: userAddress, value: amount })
    const tx = contract.methods.deposit().send({ from: userAddress, value: amount })

    if (txOptionalParams?.onSentTransaction) {
      tx.once('transactionHash', txOptionalParams.onSentTransaction)
    }

    logDebug(`[WethApi] Wrapped ${amount} ETH for user ${userAddress} in network ${networkId}`)

    return tx
  }

  public async withdraw(params: WrapUnwrapParams): Promise<Receipt> {
    const { networkId, amount, userAddress, txOptionalParams } = params
    const contract = await this._getContract(networkId)

    logDebug('[WethApi] withdraw:', amount)
    const tx = contract.methods.withdraw(amount).send({ from: userAddress })

    if (txOptionalParams?.onSentTransaction) {
      tx.once('transactionHash', txOptionalParams.onSentTransaction)
    }

    logDebug(`[WethApi] Unwapping ${amount} WETH for user ${userAddress} in network ${networkId}`)

    return tx
  }

  /********************************    private methods   ********************************/
  protected async _getContract(networkId: number): Promise<WethContract> {
    return this._getContractForNetwork(networkId)
  }

  protected _getContractForNetwork(networkId: number): WethContract {
    const address = getWethAddressByNetwork(networkId)

    return this._getContractAtAddress(networkId, address)
  }

  protected _getContractAtAddress(networkId: number, address: string): WethContract {
    let contract: WethContract | undefined = undefined

    if (WethApiImpl._contractsCache[networkId]) {
      contract = WethApiImpl._contractsCache[networkId][address]
    } else {
      WethApiImpl._contractsCache[networkId] = {}
    }

    if (contract) {
      return contract
    }

    const newContract = this._contractPrototype.clone()
    newContract.options.address = address

    return (WethApiImpl._contractsCache[networkId][address] = newContract)
  }
}

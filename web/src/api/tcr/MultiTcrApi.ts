import Web3 from 'web3'
import { AbiItem } from 'web3-utils'

import { tcrAbi } from '@gnosis.pm/dex-js'
import { TcrApi } from './TcrApi'
import { TcrContract } from '@gnosis.pm/dex-js/build-esm/contracts/TcrContract'

interface ListConfig {
  networkId: number
  contractAddress: string
  listId?: number
}

export interface MultiTcrApiParams {
  web3: Web3
  lists: ListConfig[]
}

interface ContractPerNetwork {
  [networkId: number]: TcrDetails
}

interface TcrDetails {
  listId: number
  contract: TcrContract
}

export class MultiTcrApi implements TcrApi {
  private web3: Web3
  private contractCache: ContractPerNetwork = {}

  public constructor(params: MultiTcrApiParams) {
    const { web3, lists } = params

    this.web3 = web3

    const contractPrototype = new this.web3.eth.Contract(tcrAbi as AbiItem[]) as TcrContract

    lists.forEach(list => {
      const contract = contractPrototype.clone()
      contract.options.address = list.contractAddress

      this.contractCache[list.networkId] = {
        // listId is optional, defaults to 0
        listId: list.listId ?? 0,
        contract,
      }
    })
  }

  public async getTokens(networkId: number): Promise<string[]> {
    const details = this.contractCache[networkId]

    if (!details) {
      // No TCR configured for network, defaults to empty list
      return []
    }
    const { contract, listId } = details

    return contract.methods.getTokens(listId).call()
  }
}

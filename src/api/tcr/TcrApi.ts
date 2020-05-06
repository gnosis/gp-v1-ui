import Web3 from 'web3'
import { AbiItem } from 'web3-utils'

import { TcrContract } from '@gnosis.pm/dex-js/build-esm/contracts/TcrContract'
import { tcrAbi } from '@gnosis.pm/dex-js'

export interface TcrConfig {
  [networkId: number]: {
    listId?: number
    contractAddress: string
  }
}

interface TcrDetails {
  listId: number
  contract: TcrContract
}

interface ContractPerNetwork {
  [networkId: number]: TcrDetails
}

export interface TcrApi {
  getTokens(networkId: number): Promise<string[]>
}

export interface Params {
  web3: Web3
  config: TcrConfig
}

export class TcrApiImpl implements TcrApi {
  private web3: Web3
  private contractCache: ContractPerNetwork = {}

  public constructor(params: Params) {
    const { web3, config } = params

    this.web3 = web3

    const contractPrototype = new this.web3.eth.Contract(tcrAbi as AbiItem[]) as TcrContract

    Object.keys(config).forEach(networkId => {
      const contract = contractPrototype.clone()
      contract.options.address = config[networkId].contractAddress

      this.contractCache[networkId] = {
        // listId is optional, defaults to 0
        listId: config[networkId].listId || 0,
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

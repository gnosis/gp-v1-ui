/* eslint-disable @typescript-eslint/no-explicit-any */
import WalletConnectProvider from '@walletconnect/web3-provider'
import { IJsonRpcRequest, IJsonRpcResponseSuccess, IJsonRpcResponseError } from '@walletconnect/types'
import { payloadId } from '@walletconnect/utils'

const isJsonRpcError = (res: IJsonRpcResponseSuccess | IJsonRpcResponseError): res is IJsonRpcResponseError => {
  return 'error' in res
}

const overrides = {
  async handleRequest(
    this: WalletConnectProvider,
    payload: IJsonRpcRequest,
  ): Promise<IJsonRpcResponseSuccess | IJsonRpcResponseError> {
    console.log('P', payload)
    try {
      let response
      let result = null
      const wc = await this.getWalletConnector()
      switch (payload.method) {
        case 'wc_killSession':
          await this.close()
          result = null
          break
        case 'eth_accounts':
          result = wc.accounts
          break
        case 'eth_coinbase':
          result = wc.accounts[0]
          break
        case 'eth_chainId':
          result = wc.chainId
          break
        case 'net_version':
          result = wc.networkId || wc.chainId
          break
        case 'eth_uninstallFilter':
          this.sendAsync(payload, (_: any) => _)
          result = true
          break
        // ADDED
        // Added handling .request({method: 'eth_sign*'})
        case 'eth_sendRawTransaction':
        case 'eth_sendTransaction':
        case 'eth_sign':
        case 'personal_sign':
        case 'personal_sendTransaction':
          response = await this.handleWriteRequests(payload)
          break
        default:
          response = await this.handleOtherRequests(payload)
      }
      if (response) {
        return response
      }
      return this.formatResponse(payload, result)
    } catch (error) {
      this.emit('error', error)
      throw error
    }
  },

  // ADDED
  async handleWriteRequests(this: WalletConnectProvider, payload: IJsonRpcRequest): Promise<IJsonRpcResponseSuccess> {
    return new Promise((resolve, reject) => {
      this.sendAsync(payload, (error: Error, response: IJsonRpcResponseSuccess) => {
        if (error) {
          reject(error)
        } else {
          resolve(response)
        }
      })
    })
  },

  async send(
    this: WalletConnectProvider,
    payload: IJsonRpcRequest | string | any,
    callback?: (error: Error, res: IJsonRpcResponseSuccess | IJsonRpcResponseError) => void,
  ): Promise<any> {
    // Web3 1.0 beta.38 (and above) calls `send` with method and parameters
    if (typeof payload === 'string') {
      return this.sendAsyncPromise(payload, callback) as Promise<IJsonRpcResponseSuccess>
    }
    // ensure payload includes id and jsonrpc
    payload = { id: payloadId(), jsonrpc: '2.0', ...payload }
    // Web3 1.0 beta.37 (and below) uses `send` with a callback for async queries
    if (callback) {
      this.sendAsync(payload, callback)
      return
    }

    const res = await this.handleRequest(payload)
    // CHANGED
    // removed if (!res.result) throw new Error("Failed JSON-RPC request")
    // because on eth_getTransactionreceipt result is first null
    // web3 retries on intervals until result is a valid receipt

    if (isJsonRpcError(res)) {
      throw new Error(res.error.message)
    }

    return res.result
  },
}

Object.assign(WalletConnectProvider.prototype, overrides)

export default WalletConnectProvider

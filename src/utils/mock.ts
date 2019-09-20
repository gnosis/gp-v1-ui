import { TxOptionalParams } from 'types'
import { wait } from './time'
import { RECEIPT } from '../../test/data'

export async function waitAndSendReceipt(params: {
  waitTime?: number
  waitTimeForReceipt?: number
  txOptionalParams?: TxOptionalParams
}): Promise<void> {
  const { waitTime = 2500, waitTimeForReceipt = 1000, txOptionalParams } = params
  if (txOptionalParams && txOptionalParams.onSentTransaction) {
    wait(waitTimeForReceipt).then(() => txOptionalParams.onSentTransaction(RECEIPT))
  }
  await wait(waitTime)
}

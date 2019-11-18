import React from 'react'
import { TxOptionalParams, Receipt } from 'types'
import { TxNotification } from 'components/TxNotification'
import { toast } from 'react-toastify'

export const txOptionalParams: TxOptionalParams = {
  onSentTransaction: (receipt: Receipt): void => {
    if (receipt.transactionHash) {
      toast.info(<TxNotification txHash={receipt.transactionHash} />)
    } else {
      console.error(`Failed to get notification for tx ${receipt.transactionHash}`)
    }
  },
}

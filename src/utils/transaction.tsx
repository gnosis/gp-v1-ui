import React from 'react'
import { TxOptionalParams } from 'types'
import { TxNotification } from 'components/TxNotification'
import { toast } from 'react-toastify'

export const txOptionalParams: TxOptionalParams = {
  onSentTransaction: (transactionHash: string): void => {
    if (transactionHash) {
      toast.info(<TxNotification txHash={transactionHash} />)
    } else {
      console.error(`Failed to get notification for tx ${transactionHash}`)
    }
  },
}

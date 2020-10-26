import React from 'react'

import { openGlobalModal } from './SingletonModal'

export const WaitForTxApprovalMessage: React.FC<{ timePassed: number }> = ({ timePassed }) => {
  return (
    <p>
      It has been {timePassed} seconds since transaction was submitted for approval. Some wallets do not respond to{' '}
      <code>eth_sendTransaction</code> calls. Stop waiting for transaction approval from Wallet?
    </p>
  )
}
export const openWaitForTxApprovalModal = (timePassed: number): Promise<boolean> =>
  openGlobalModal({ message: <WaitForTxApprovalMessage timePassed={timePassed} /> })

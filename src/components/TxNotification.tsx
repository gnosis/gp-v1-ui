import React from 'react'
import { BlockExplorerLink } from 'components/common/BlockExplorerLink'

interface TxNotificationProps {
  txHash: string
}

export const TxNotification: React.FC<TxNotificationProps> = ({ txHash }: TxNotificationProps) => {
  const link = <BlockExplorerLink type="tx" identifier={txHash} />

  if (link) {
    return <div>The transaction has been sent! Check {link} for details</div>
  } else {
    return null
  }
}

import React from 'react'
import { EtherscanLink } from 'components/atoms/EtherscanLink'

interface TxNotificationProps {
  txHash: string
}

export const TxNotification: React.FC<TxNotificationProps> = ({ txHash }: TxNotificationProps) => {
  const link = <EtherscanLink type="tx" identifier={txHash} />

  if (link) {
    return <div>The transaction has been sent! Check {link} for details</div>
  } else {
    return null
  }
}

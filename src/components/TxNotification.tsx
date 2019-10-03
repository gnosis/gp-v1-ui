import React from 'react'
import { abbreviateString, getEtherscanDomainPrefix } from 'utils'
import { useWalletConnection } from 'hooks/useWalletConnection'

interface TxNotificationProps {
  txHash: string
}

export const TxNotification: React.FC<TxNotificationProps> = ({ txHash }: TxNotificationProps) => {
  const { networkId } = useWalletConnection()

  if (!networkId) {
    return null
  }

  const href = `https://${getEtherscanDomainPrefix(networkId)}etherscan.io/tx/${txHash}`

  return (
    <div>
      The transaction has been sent! Check{' '}
      <a href={href} target="_blank" rel="noopener noreferrer">
        {abbreviateString(txHash, 6, 4)}
      </a>{' '}
      for details
    </div>
  )
}

import React from 'react'
import { abbreviateString } from 'utils'
import { Network } from 'types'
import { useWalletConnection } from 'hooks/useWalletConnection'

interface TxNotificationProps {
  txHash: string
}

function getDomainPrefix(networkId: Network): string {
  return !networkId || networkId === Network.Mainnet ? '' : Network[networkId].toLowerCase() + '.'
}

export const TxNotification: React.FC<TxNotificationProps> = ({ txHash }: TxNotificationProps) => {
  const { networkId } = useWalletConnection()
  const href = `https://${getDomainPrefix(networkId)}etherscan.io/tx/${txHash}`

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

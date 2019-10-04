import React, { ReactElement } from 'react'
import { useWalletConnection } from 'hooks/useWalletConnection'
import { abbreviateString } from 'utils'
import { Network } from 'types'

type EtherscanLinkType = 'tx' | 'address' | 'contract' | 'token'

export interface EtherscanLinkProps {
  type: EtherscanLinkType
  identifier: string
  label?: string | ReactElement | void
}

function getEtherscanDomainPrefix(networkId: Network): string {
  return !networkId || networkId === Network.Mainnet ? '' : Network[networkId].toLowerCase() + '.'
}

function getEtherscanDomainSuffix(type: EtherscanLinkType, identifier: string): string {
  switch (type) {
    case 'tx':
      return `tx/${identifier}`
    case 'address':
      return `address/${identifier}`
    case 'contract':
      return `address/${identifier}#code`
    case 'token':
      return `token/${identifier}`
  }
}

export const EtherscanLink: React.FC<EtherscanLinkProps> = ({ type, identifier, label }) => {
  const { networkId } = useWalletConnection()

  if (!networkId) {
    return null
  }

  const href = `https://${getEtherscanDomainPrefix(networkId)}etherscan.io/${getEtherscanDomainSuffix(
    type,
    identifier,
  )}`
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {label ? label : abbreviateString(identifier, 6, 4)}
    </a>
  )
}

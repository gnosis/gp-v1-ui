import React, { ReactElement } from 'react'
import { useWalletConnection } from 'hooks/useWalletConnection'
import { abbreviateString } from 'utils'
import { Network } from 'types'

type BlockExplorerLinkType = 'tx' | 'address' | 'contract' | 'token' | 'event'

export interface Props {
  /**
   * type of BlockExplorerLink
   */
  type: BlockExplorerLinkType
  /**
   * address or transaction or other hash
   */
  identifier: string
  /**
   * network number | chain id
   */
  networkId?: number
  /**
   * label to replace textContent generated from indentifier
   */
  label?: string | ReactElement | void

  /**
   * Use the URL as a label
   */
  useUrlAsLabel?: boolean
  /**
   * className to pass on to <a/>
   */
  className?: string // to allow subclassing styles with styled-components
}

function getEtherscanUrlPrefix(networkId: Network): string {
  return !networkId || networkId === Network.Mainnet ? '' : (Network[networkId] || '').toLowerCase() + '.'
}

function getEtherscanUrlSuffix(type: BlockExplorerLinkType, identifier: string): string {
  switch (type) {
    case 'tx':
      return `tx/${identifier}`
    case 'event':
      return `tx/${identifier}#eventlog`
    case 'address':
      return `address/${identifier}`
    case 'contract':
      return `address/${identifier}#code`
    case 'token':
      return `token/${identifier}`
  }
}

function getBlockscoutUrlPrefix(networkId: number): string {
  switch (networkId) {
    case Network.xDAI:
      return 'poa/xdai'

    default:
      return ''
  }
}

function getBlockscoutUrlSuffix(type: BlockExplorerLinkType, identifier: string): string {
  switch (type) {
    case 'tx':
      return `tx/${identifier}`
    case 'event':
      return `tx/${identifier}/logs`
    case 'address':
      return `address/${identifier}/transactions`
    case 'contract':
      return `address/${identifier}/contracts`
    case 'token':
      return `tokens/${identifier}/token-transfers`
  }
}

function getBlockscoutUrl(networkId: number, type: BlockExplorerLinkType, identifier: string): string {
  return `https://blockscout.com/${getBlockscoutUrlPrefix(networkId)}/${getBlockscoutUrlSuffix(type, identifier)}`
}

function getEtherscanUrl(networkId: number, type: BlockExplorerLinkType, identifier: string): string {
  return `https://${getEtherscanUrlPrefix(networkId)}etherscan.io/${getEtherscanUrlSuffix(type, identifier)}`
}

function getExplorerUrl(networkId: number, type: BlockExplorerLinkType, identifier: string): string {
  return networkId === Network.xDAI
    ? getBlockscoutUrl(networkId, type, identifier)
    : getEtherscanUrl(networkId, type, identifier)
}

export const BlockExplorerLink: React.FC<Props> = ({
  type,
  identifier,
  label: labelProp,
  useUrlAsLabel = false,
  className,
  networkId: networkIdFixed,
}) => {
  const { networkIdOrDefault: networkIdWallet } = useWalletConnection()

  const networkId = networkIdFixed || networkIdWallet

  if (!networkId || !identifier) {
    return null
  }

  const url = getExplorerUrl(networkId, type, identifier)
  const label = labelProp || (useUrlAsLabel && url) || abbreviateString(identifier, 6, 4)

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={className}>
      {label}
    </a>
  )
}

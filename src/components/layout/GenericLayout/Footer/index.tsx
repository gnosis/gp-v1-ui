import React from 'react'
import styled from 'styled-components'
import { depositApi } from 'api'

// Components
import { BlockExplorerLink } from 'components/common/BlockExplorerLink'

// Hooks
import { useWalletConnection } from 'hooks/useWalletConnection'

// Config
import { footerConfig } from '../Footer/config'

const FooterStyled = styled.footer`
  position: fixed;
  font-size: 1.1rem;
  bottom: 0;
  height: 3rem;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  padding: 0 1rem;
  border-top: 0.1rem solid var(--color-border);
  flex: 1 1 auto;
  background: var(--color-gradient-1);
  width: 100%;
  color: var(--color-text-secondary2);
  justify-content: space-between;
`

const VerifiedButton = styled(BlockExplorerLink)`
  margin: 0 auto 0 0.6rem;
`

const VersionsWrapper = styled.div`
  display: flex;
  margin: 0 0 0 auto;

  > a {
    text-decoration: none;

    &:focus,
    &:hover {
      text-decoration: underline;
    }
  }

  > a:not(:last-of-type) {
    margin: 0 1.6rem 0 0;
    flex-flow: row nowrap;
    display: flex;
    position: relative;

    &::after {
      content: '-';
      position: absolute;
      right: -1rem;
      display: block;
    }
  }
`

export interface FooterType {
  readonly verifiedText?: string
  readonly isBeta?: boolean
  readonly url?: {
    readonly web: string
    readonly appId: string
    readonly contracts: string
  }
}

export const Footer: React.FC<FooterType> = () => {
  const { verifiedText, isBeta, url } = footerConfig
  const { networkIdOrDefault: networkId } = useWalletConnection()
  const contractAddress = depositApi.getContractAddress(networkId)

  return (
    <FooterStyled>
      {isBeta && 'This project is in beta. Use at your own risk.'}
      {contractAddress && networkId ? (
        <VerifiedButton
          type="contract"
          identifier={contractAddress}
          networkId={networkId}
          label={verifiedText ? verifiedText : 'View contract'}
        />
      ) : null}
      <VersionsWrapper>
        {url.web && VERSION ? (
          <a target="_blank" rel="noopener noreferrer" href={url.web + VERSION}>
            Web: v{VERSION}
          </a>
        ) : null}
        {url.appId && CONFIG.appId ? (
          <a target="_blank" rel="noopener noreferrer" href={url.appId}>
            App Id: {CONFIG.appId}
          </a>
        ) : null}
        {url.contracts && CONTRACT_VERSION ? (
          <a target="_blank" rel="noopener noreferrer" href={url.contracts + CONTRACT_VERSION}>
            Contracts: v{CONTRACT_VERSION}
          </a>
        ) : null}
      </VersionsWrapper>
    </FooterStyled>
  )
}

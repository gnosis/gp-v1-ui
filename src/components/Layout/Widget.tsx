import React from 'react'
import styled from 'styled-components'
import { depositApi } from 'api'
import { EtherscanLink } from 'components/EtherscanLink'
import { useWalletConnection } from 'hooks/useWalletConnection'
import PageWrapper from './PageWrapper'

const Wrapper = styled(PageWrapper)`
  overflow-x: auto;
  font-size: 0.85rem;
  padding-bottom: 4em;
  padding: 2em;
  border-radius: var(--border-radius);
  min-width: 58vw;

  display: flex;
  flex-direction: column;

  @media only screen and (max-width: 866px) {
    margin: 0 auto 3rem;
    padding: 1em;
  }
`

const LinkWrapper = styled(EtherscanLink)`
  text-align: right;
  margin-bottom: 3em;
  display: block;
`

interface Props {
  children: React.ReactNode
  className?: string
}

const Widget: React.FC<Props> = ({ children, className }) => {
  const { networkId } = useWalletConnection()
  const contractAddress = networkId ? depositApi.getContractAddress(networkId) : null

  return (
    <Wrapper className={className} $bgColor="transparent" $boxShadow="none" $width="auto">
      {contractAddress && (
        <LinkWrapper type="contract" identifier={contractAddress} label={<small>View verified contract</small>} />
      )}
      {children}
    </Wrapper>
  )
}

export default Widget

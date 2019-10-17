import React from 'react'
import styled from 'styled-components'
import { depositApi } from 'api'
import { EtherscanLink } from 'components/EtherscanLink'

const Wrapper = styled.section`
  overflow-x: auto;
  font-size: 0.85rem;
  padding-bottom: 4em;
`

const LinkWrapper = styled.div`
  a {
    text-align: right;
    margin-bottom: 3em;
    display: block;
  }
`

const Widget: React.FC = ({ children }) => {
  const contractAddress = depositApi.getContractAddress()

  const contractLink = (
    <EtherscanLink type="contract" identifier={contractAddress} label={<small>View verified contract</small>} />
  )

  return (
    <Wrapper className="widget">
      {contractLink && <LinkWrapper>{contractLink}</LinkWrapper>}
      {children}
    </Wrapper>
  )
}

export default Widget

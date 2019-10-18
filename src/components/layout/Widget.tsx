import React from 'react'
import styled from 'styled-components'
import { depositApi } from 'api'
import { EtherscanLink } from 'components/EtherscanLink'

const Wrapper = styled.section`
  overflow-x: auto;
  font-size: 0.85rem;
  padding-bottom: 4em;
  padding: 2em;
  border-radius: 10px;
  min-width: 58vw;

  //TODO: 4 lines bellow duplicated from "page" css.
  //extract into a common "section" component
  background-color: white;
  margin: -3rem auto 3rem auto;
  box-shadow: 1px 1px #e8e8e8;
  min-height: 25rem;
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
    <Wrapper>
      {contractLink && <LinkWrapper>{contractLink}</LinkWrapper>}
      {children}
    </Wrapper>
  )
}

export default Widget

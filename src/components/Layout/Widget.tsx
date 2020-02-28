import React from 'react'
import styled from 'styled-components'
import { PageWrapper } from './PageWrapper'

const Wrapper = styled(PageWrapper)`
  display: flex;
  justify-content: center;
  width: 100%;
  flex-flow: column wrap;
`

interface Props {
  children: React.ReactNode
  className?: string
}

const Widget: React.FC<Props> = ({ children, className }) => {
  return (
    <Wrapper className={className} $bgColor="transparent" $boxShadow="none" $width="auto">
      {children}
    </Wrapper>
  )
}

export default Widget

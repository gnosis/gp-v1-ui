import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
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
  return <Wrapper className={className}>{children}</Wrapper>
}

export default Widget

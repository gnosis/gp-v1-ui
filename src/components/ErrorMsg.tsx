import React from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDizzy } from '@fortawesome/free-regular-svg-icons'

const Wrapper = styled.div`
  text-align: center;
  font-size: 1.6rem;
  margin: auto;

  p {
    color: var(--color-text-secondary);
  }
`

interface ErrorMsgProps {
  title?: string
  message: string
}

const ErrorMsg: React.FC<ErrorMsgProps> = ({ title, message }: ErrorMsgProps) => (
  <Wrapper>
    <FontAwesomeIcon icon={faDizzy} size="6x" />
    {title && <h3>{title}</h3>}
    <p>{message}</p>
  </Wrapper>
)

export default ErrorMsg

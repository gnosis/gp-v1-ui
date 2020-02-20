import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: inherit;
  margin: 0 0 0 0.3rem;
  color: #476481;

  > a {
    color: #218dff;
    margin: 0 0 0 0.3rem;
  }

  .success {
    color: green;
    text-decoration: none;
  }

  &.error,
  &.warning {
    margin: 1rem 0;
    line-height: 1.2;
    font-size: 1.2rem;
    display: block;
    > strong {
      color: inherit;
    }
  }

  &.error {
    color: red;
  }
  &.warning {
    color: #476481;
    background: #fff0eb;
    border-radius: 0 0 0.3rem 0.3rem;
    padding: 0.5rem;
    box-sizing: border-box;
    margin: 0.3rem 0 1rem;
  }
`
interface Props {
  children: React.ReactNode
  className?: string
}

const FormMessage: React.FC<Props> = ({ className = 'error', children }, ref) => {
  return (
    <Wrapper ref={ref} className={className}>
      {children}
    </Wrapper>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default React.forwardRef<any, Props>(FormMessage)

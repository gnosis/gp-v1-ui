import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

const Wrapper = styled.div``

const NotFound2: React.FC = () => (
  <Wrapper>
    <h1>Not found</h1>
    <p>We&apos;re sorry, the page you requested could not be found</p>
    <p>
      Please go back to the&nbsp;
      <Link to="/v2">home page</Link>
    </p>
  </Wrapper>
)

export default NotFound2

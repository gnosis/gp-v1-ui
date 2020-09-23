import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  h2 {
    margin: 20px;
  }

  text-align: center;
`

export const Trading: React.FC = () => (
  <Wrapper>
    <h2>Trading page</h2>
    <img src="https://media.giphy.com/media/3o8dFzIXb0qaE3pYWs/source.gif"></img>
  </Wrapper>
)

export default Trading

import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  display: flex;
  overflow: hidden;
  flex: 1 1 auto;
  width: 100%;
  height: calc(100vh - var(--height-bar-default));
  position: fixed;
  top: var(--height-bar-default);
`

export const Home: React.FC = () => (
  <Wrapper>
    <h1>Gnosis Protocol Explorer</h1>
    <p>Welcome :)</p>
  </Wrapper>
)

export default Home

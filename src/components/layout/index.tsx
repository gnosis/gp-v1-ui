import React from 'react'
import Header from './Header'
import Footer from './Footer'
import styled from 'styled-components'

const Wrapper = styled.div`
  min-height: 100vh;
  width: 100%;

  display: grid;
  grid-template-rows: auto;

  main {
    flex: 1;
    margin: auto;
    min-width: 40vw;

    @media (max-width: 768px) {
      width: 95%;
    }
  }
`

const Layout: React.FC = ({ children }) => (
  <Wrapper>
    <Header />
    <main>{children}</main>
    <Footer />
  </Wrapper>
)

export default Layout

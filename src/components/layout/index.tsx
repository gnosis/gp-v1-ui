import React from 'react'
import styled from 'styled-components'

import Header from './Header'
import Footer from './Footer'
import LegalBanner from '../LegalBanner'

const Wrapper = styled.div`
  min-height: 100vh;
  width: 100%;

  display: grid;
  grid-template-rows: 50px auto;

  main {
    flex: 1;
    margin: auto;
    min-width: 40vw;

    @media only screen and (max-width: 768px) {
      width: 100%;
    }
  }
`

const Layout: React.FC = ({ children }) => (
  <Wrapper>
    <LegalBanner startOpen={false} useFull={false} title="💀 This project is in beta. Use at your own risk." />
    <Header />
    <main>{children}</main>
    <Footer />
  </Wrapper>
)

export default Layout

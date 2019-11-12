import React from 'react'
import styled from 'styled-components'

import { LEGALDOCUMENT } from 'const'

import Header from './Header'
import Footer from './Footer'
import LegalBanner from '../LegalBanner'

const Wrapper = styled.div`
  min-height: 100vh;
  width: 100%;

  display: grid;
  grid-template-rows: auto;

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
    <LegalBanner startOpen={false} title={LEGALDOCUMENT.TITLE} />
    <Header />
    <main>{children}</main>
    <Footer />
  </Wrapper>
)

export default Layout

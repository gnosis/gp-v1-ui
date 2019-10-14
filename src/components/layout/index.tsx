import React from 'react'
import styled from 'styled-components'

import { LEGALDOCUMENT } from 'const'

import Header from './Header'
import Footer from './Footer'
import LegalBanner from '../LegalBanner'

const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  main {
    flex: 1;
    margin: auto;
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

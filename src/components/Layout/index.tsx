import React from 'react'
import styled from 'styled-components'

import Header from './Header'
import Footer from './Footer'
import LegalBanner from '../LegalBanner'

import { RESPONSIVE_SIZES } from 'const'

const Wrapper = styled.div`
  min-height: 100vh;
  width: 100%;

  display: grid;
  grid-template-rows: 3.125rem 0.2fr auto;

  main {
    flex: 1;
    margin: auto;
    min-width: 40vw;

    @media only screen and (max-width: ${RESPONSIVE_SIZES.TABLET}em) {
      width: 100%;
    }
  }
`

const Layout: React.FC = ({ children }) => (
  <Wrapper>
    <LegalBanner startOpen={false} useFull={false} title="💀 This project is in beta. Use at your own risk." />
    <Header
      navigation={[
        {
          label: 'Trade',
          to: '/trade',
          order: 1,
        },
        {
          label: 'Wallet',
          to: '/wallet',
          order: 2,
          withPastLocation: true,
        },
        // {
        //   label: 'Orders',
        //   to: '/orders',
        //   order: 3,
        //   withPastLocation: true,
        // },
        // Place holder
        // {
        //   label: 'Strategies',
        //   to: '/strategies',
        //   order: 4,
        //   withPastLocation: true,
        // },
      ]}
    />
    <main>{children}</main>
    <Footer />
  </Wrapper>
)

export default Layout

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
  grid-template-rows: 3.125rem 0.2fr auto min-content;

  main {
    flex: 1;
    margin: 0 auto;
    max-width: 85rem;
    width: 100%;
    display: flex;
    flex-flow: row wrap;
    align-items: flex-start;
    justify-content: flex-start;

    /* @media only screen and (max-width: ${RESPONSIVE_SIZES.TABLET}em) {
      width: 100%;
    } */
  }
`

const Layout: React.FC = ({ children }) => (
  <Wrapper>
    <LegalBanner startOpen={false} useFull={false} title="💀 This project is in beta. Use at your own risk." />
    <Header
      navigation={[
        {
          label: 'Order',
          to: '/order',
          order: 1,
        },
        {
          label: 'Liquidity',
          to: '/liquidity',
          order: 2,
          withPastLocation: true,
        },
        {
          label: 'Balances',
          to: '/balances',
          order: 3,
          withPastLocation: true,
        }
      ]}
    />
    <main>{children}</main>
    <Footer />
  </Wrapper>
)

// {
//   label: 'Orders',
//   to: '/orders',
//   order: 3,
//   withPastLocation: true,
// },

export default Layout

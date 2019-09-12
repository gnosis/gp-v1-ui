import * as React from 'react'
import Header from './Header'
import Footer from './Footer'
import styled from 'styled-components'

const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  main {
    flex: 1;
    padding: 4rem 3rem 10rem 3rem;
    margin: auto;
  }
`

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }: LayoutProps) => (
  <Wrapper>
    <Header />
    <main>{children}</main>
    <Footer />
  </Wrapper>
)

export default Layout

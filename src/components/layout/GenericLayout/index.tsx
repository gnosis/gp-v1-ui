import React from 'react'
import { Header } from './Header'
import GlobalStyles from './GlobalStyles'
import { Frame } from 'components/common/Frame'

const Footer: React.FC = () => (
  <Frame>
    <footer>Footer</footer>
  </Frame>
)

export const GenericLayout: React.FC = ({ children }) => (
  <div>
    <GlobalStyles />
    <Header />
    {children}
    <Footer />
  </div>
)

export default GenericLayout

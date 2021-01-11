import React from 'react'

// Styles
import GlobalStyles from './GlobalStyles'

// Header
import { Header } from './Header'

// Footer
import { Footer } from './Footer'

export interface Props {
  menu?: React.ReactNode
  navTools?: React.ReactNode
}

export const GenericLayout: React.FC<Props> = ({ children, menu, navTools }) => (
  <div>
    <GlobalStyles />
    <Header menu={menu} tools={navTools} />
    {children}
    <Footer />
  </div>
)

export default GenericLayout

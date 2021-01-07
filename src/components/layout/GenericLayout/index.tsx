import React from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { StaticGlobalStyle } from 'theme'
export interface Props {
  menu?: React.ReactNode
  navTools?: React.ReactNode
}

export const GenericLayout: React.FC<Props> = ({ children, menu, navTools }) => (
  <div>
    <StaticGlobalStyle />
    <Header menu={menu} tools={navTools} />
    {children}
    <Footer />
  </div>
)

export default GenericLayout

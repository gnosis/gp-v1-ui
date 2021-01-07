import React from 'react'
import { Header } from './Header'
import { Frame } from 'components/common/Frame'
import { StaticGlobalStyle } from 'theme'

const Footer: React.FC = () => (
  <Frame>
    <footer>Footer</footer>
  </Frame>
)

interface Props {
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

import React from 'react'
import { Header } from './Header'
import GlobalStyles from './GlobalStyles'
import { Frame } from 'components/common/Frame'

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
    <GlobalStyles />
    <Header menu={menu} tools={navTools} />
    {children}
    <Footer />
  </div>
)

export default GenericLayout

import styled, { createGlobalStyle } from 'styled-components'

export const Global = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  html,
  body,
  #root {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    overflow: hidden;
    background: lightblue;
  }
   body, #root {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
   }

  div, span, section, article, footer, header, main {
    outline: 1px dotted gray;
  }
`

export const Main = styled.main`
    flex: 1 0 auto;
    max-width: 40rem;
    padding: 2em;
    background: antiquewhite;
`
export const Footer = styled.footer`
    flex-shrink: 0;
`
export const Header = styled.header`
    flex-shrink: 0;
`

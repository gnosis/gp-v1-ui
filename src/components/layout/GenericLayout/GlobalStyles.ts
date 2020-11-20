import { createGlobalStyle } from 'styled-components'
import fontFace from 'styles/fonts'
import variables from './variablesCss'

const GlobalStyles = createGlobalStyle`
  /* global root variables */
  ${variables}
  /* Import font faces */
  ${fontFace}

  html, body {  
    height: 100vh;
    width: 100vw;
    margin: 0;
    font-size: 62.5%;
    line-height: 10px;
    font-family: var(--font-default);
    background-image: linear-gradient(0deg, var(--color-gradient-1) 0%, var(--color-gradient-2) 100%);
    color: var(--color-text-primary);
    box-sizing: border-box;
    scroll-behavior: smooth;
    text-rendering: geometricPrecision;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  *::selection {
    background: var(--color-background-selection); /* WebKit/Blink Browsers */
    color: var(--color-text-selection);
  }
  *::-moz-selection {
    background: var(--color-background-selection); /* Gecko Browsers */
  }
  *::-webkit-selection {
    background: var(--color-background-selection); /* Chrome Browsers */
  }

  *::-moz-placeholder {
    line-height: revert;
  }

  ::-webkit-scrollbar {
    width: 6px !important;
    height: 6px !important;
  }
  ::-webkit-scrollbar-thumb {
      background-color: rgba(0,0,0,.2);
  }
  ::-webkit-scrollbar-track {
      background: hsla(0,0%,100%,.1);
  }

  *, *:before, *:after {
    box-sizing: inherit;
  }
  a {   
    text-decoration: underline;
    cursor: pointer;
      &:link, 
      &:visited {
        color: var(--color-text-active);
      }
  }

  h1, h2, h3 {
    margin: 0;
    margin: 0.5rem 0;
  }
  h1 {
    font-size: 3rem;
  }
  h2 {
    font-size: 2rem;
  }  
`

export default GlobalStyles

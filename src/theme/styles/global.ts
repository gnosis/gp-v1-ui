import { createGlobalStyle, css } from 'styled-components'

import fontFace from './fonts'
import { web3ModalOverride } from './overrides'

// TODO: remove for constants from colour palette later
import variables from 'components/layout/GenericLayout/variablesCss'

// TODO: replace these variables w/Colour constants (later):
// --color-text-primary: #456483
// --color-gradient-1: #21222E
// --color-gradient-2: #2C2D3F
// --color-background-selection: #218DFF
// --color-text-active: #218DFF

const selection = css`
  /* CSS for selecting text */
  *::selection {
    background: #218dff; /* WebKit/Blink Browsers */
  }
  *::-moz-selection {
    background: #218dff; /* Gecko Browsers */
  }
  *::-webkit-selection {
    background: #218dff; /* Chrome Browsers */
  }
  /* End CSS for selecting text */
`

const scrollbars = css`
  ::-webkit-scrollbar {
    width: 6px !important;
    height: 6px !important;
  }
  ::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
  }
  ::-webkit-scrollbar-track {
    background: hsla(0, 0%, 100%, 0.1);
  }
`

export const StaticGlobalStyle = createGlobalStyle`
  /* TEMPORARY: import variables */ 
  ${variables}
  
  /* Import font faces */
  ${fontFace}

  /* Selection CSS */
  ${selection}

  /* Scrollbars CSS */
  ${scrollbars}

  .noScroll {
    overflow: hidden;
  }

  .not-implemented {
    display: none !important
  }

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
  
  /* Overrides CSS - see overrides.ts file */
  ${web3ModalOverride}  
`

export const ThemedGlobalStyle = createGlobalStyle`
  html, body {
    /* Dynamic, theme interpolated styles here! */
  }
`

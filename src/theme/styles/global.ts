import { createGlobalStyle, css } from 'styled-components'

import fontFace from './fonts'
import { web3ModalOverride } from './overrides'

// TODO: replace these variables:
// --color-text-primary: #456483
// --color-gradient-1: #21222E
// --color-gradient-2: #2C2D3F

const selection = css`
  /* CSS for selecting text */
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
    font-family: "Inter", "Helvetica Neue", Helvetica, sans-serif;
    font-size: 62.5%;
    color: #456483;
    
    height: 100vh;
    min-height: 100vh;
    width: 100vw;
    min-width: 300px;
    margin: 0;
    line-height: 10px;
    
    background-image: linear-gradient(0deg, #21222E, 0%, #2C2D3F, 100%);
    
    box-sizing: border-box;
    
    scroll-behavior: smooth;
    
    text-rendering: geometricPrecision;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  *::-moz-placeholder {
    line-height: revert;
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

  /* TODO: review this CSS below considering HTML/Body set font-size it's non-sensical */
  #root {
    height: 100%;
    font-size: 1.3rem;
  }
  
  /* Overrides CSS - see overrides.ts file */
  ${web3ModalOverride}  
`

export const ThemedGlobalStyle = createGlobalStyle`
  html, body {
    /* Dynamic, theme interpolated styles here! */
  }
`

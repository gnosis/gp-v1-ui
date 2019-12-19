import { createGlobalStyle } from 'styled-components'
import fontFace from './fonts'
import variables from './variables'
import { RESPONSIVE_SIZES } from 'const'

const GlobalStyles = createGlobalStyle`
  // global root variables
  ${variables}
  // Import font faces
  ${fontFace}

  html, body {  
    min-height: 100vh;
    min-width: 320px;
    margin: 0;
    font-size: 16px;
    font-family: "Averta", Arial, Helvetica Neue, Helvetica, sans-serif;
    
    line-height: 1.5;
    
    background-color: var(--color-background);
    color: var(--color-text-primary);
    box-sizing: border-box;
  }
  *, *:before, *:after {
    box-sizing: inherit;
  }
  a {   
    text-decoration: underline;
    cursor: pointer;
    &, &:link, &:visited {
      color: var(--color-text-primary);
    }
    :hover {
      color: var(--color-text-secondary);
    }
  }
  h1, h2, h3 {
    margin: 0;
    margin: 0.5em 0;
  }
  h1 {
    font-size: 3rem;
    @media  only screen and (max-width: ${RESPONSIVE_SIZES.MOBILE}px) {
      font-size: 2.4rem;
    }    
  }
  h2 {
    font-size: 2rem;
    @media  only screen and (max-width: ${RESPONSIVE_SIZES.MOBILE}px) {
      font-size: 1.4rem;
    }
  }

  #root {
    min-height: 100vh;
  }

  button {
    background-color: var(--color-background-pageWrapper);
    color: var(--color-button-primary);
    border: 2px solid var(--color-button-primary);
    border-radius: var(--border-radius);

    font-family: inherit;
    font-size: 100%;
    font-weight: bolder;
    cursor: pointer;

    padding: 0.33rem 0.5rem;
    margin: 0.5rem;
        
    transition: all 0.2s ease-in-out;

    :hover {
      background-color: var(--color-button-primary);
      border-color: var(--color-button-primary);
      color: var(--color-background-pageWrapper);
    }

    &:disabled,
    &[disabled]{
      background-color: var(--color-button-disabled) !important;
      border-color: var(--color-button-disabled) !important;
      color: var(--color-background-pageWrapper) !important;
      pointer-events: none;
    }
    &.success {
      border-color: var(--color-button-success);
      color: var(--color-button-success);
      :hover {
        background-color: var(--color-button-success);
        border-color: var(--color-button-success);
        color: var(--color-background-pageWrapper);
      }
    }
    &.danger {
      border-color: var(--color-button-danger);
      color: var(--color-button-danger);
      :hover {
        background-color: var(--color-button-danger);
        border-color: var(--color-button-danger);
        color: var(--color-background-pageWrapper);
      }
    }
    &.secondary {
      border-color: #696969;
      color: #696969;
      :hover {
        border-color: black;
        color: black;
      }
    }
    &.big {
      font-size: 1.2em;
      padding: 0.65em 1em;
    }
    &.small {
      font-size: 0.6em;
      padding: 0.3em 0.5em;
    }
  }

  input {
    background-color: var(--color-background-pageWrapper);
    border: none;
    border-radius: var(--border-radius);
    outline: none;

    font-family: inherit;
    font-size: 0.75rem;
    font-weight: bold;
    
    padding: 0.65em;
    margin: 0.4em 0.85em;
    width: 100%;

    transition: all 0.2s ease-in-out;

    &:focus {
      border: 0.11rem solid var(--color-text-primary);
    }
    &:disabled {
      background-color: #e0e0e0;
      border-color: #ababab;
    }
  }
  
  .noScroll {
    overflow: hidden;
  }
`

export default GlobalStyles

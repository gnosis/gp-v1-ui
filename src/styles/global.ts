import { createGlobalStyle } from 'styled-components'
import fontFace from './fonts'
import variables from './variables'

const GlobalStyles = createGlobalStyle`
  // global root variables
  ${variables}
  // Import font faces
  ${fontFace}

  // Web3Connect styling
  // SUUUUPER lame and hacky, but don't feel like changing the Web3Conect code base to allow style passing
  // or am i missing something?
  #WEB3_CONNECT_MODAL_ID > div > div > div:nth-child(2) {
    background: transparent;
    grid-gap: 0.4rem;
    div {
      background: var(--color-background);
      border-radius: var(--border-radius);
      color: var(--color-text-primary);
    }
  }

  html, body {  
    width: 100%;
    height: auto;
    margin: 0;
    font-size: 62.5%;
    line-height: 10px;
    font-family: var(--font-default);
    background-color: var(--color-background);
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

  // body::-webkit-scrollbar-track {
  //   -webkit-box-shadow: inset 0 0 .6rem rgba(0,0,0,.3);
  //   background-color: var(--color-background);
  // }

  // body::-webkit-scrollbar {
  //   width: 1.2rem;
  //   background-color: var(--color-background);
  // }

  // body::-webkit-scrollbar-thumb {
  //   border-radius: 1rem;
  //   -webkit-box-shadow: inset 0 0 .6rem rgba(0,0,0,.3);
  //   background-color: var(--color-background-pageWrapper);
  // }

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

  #root {
    min-height: 100vh;
  }

  button {
    font-family: inherit;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    border: 0;
    font-weight: var(--font-weight-medium);

    :hover {
      background-color: #0B66C6;
    }

    &:disabled,
    &[disabled]{
      opacity: .7;
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
      font-size: 1.2rem;
      padding: 0.65rem 1rem;
    }
    &.small {
      font-size: 0.6rem;
      padding: 0.3rem 0.5rem;
    }
  }

  input {
    background-color: var(--color-background-pageWrapper);
    border: 0.11rem solid transparent;
    border-radius: var(--border-radius);
    color: var(--color-text-primary);
    outline: none
    font-family: inherit;
    font-size: 0.75rem;
    font-weight: var(--font-weight-bold);
    padding: 0.65rem;
    margin: 0.4rem 0.85rem;
    width: 100%;

    &:focus {
      border-color: var(--color-text-primary);
    }
    &:disabled {
      opacity: .5;
    }
  }
  
  .noScroll {
    overflow: hidden;
  }
`

export default GlobalStyles

import { createGlobalStyle } from 'styled-components'
import fontFace from './fonts'
import variables from './variables'

const GlobalStyles = createGlobalStyle`
  // global root variables
  ${variables}
  // Import font faces
  ${fontFace}

  html, body {  
    min-height: 100vh;
    margin: 0;

    font-size: 16px;
    font-family: "Averta", "Montserrat", Arial, Helvetica Neue, Helvetica, sans-serif;
    
    line-height: 1.5;
    
    background-color: var(--color-background);;
    color: var(--color-text-primary);

    box-sizing: border-box;
  }

  *, *:before, *:after {
    box-sizing: inherit;
  }

  a {   
    text-decoration: none;
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
    font-weight: 1000;
    @media  only screen and (max-width: 480px) {
      font-size: 2.4rem;
    }    
  }

  h2 {
    font-size: 2rem;
    @media  only screen and (max-width: 480px) {
      font-size: 1.4rem;
    }
  }

  // cleaning default browser styles
  button {
    font-family: inherit;
    font-size: 100%;
    padding: 0;
    margin: 0;
    cursor: pointer;
  }

  #root {
    min-height: 100vh;
  }

  button {
    
  }

  input {
    padding: 0.65em;
    margin: 0.4em 0.85em;
    font-size: 0.85rem;

    :disabled {
      background-color: #e0e0e0;
      border-color: #ababab;
    }
  }

  //TODO: extract into a Page component
  .page {
    background-color: white;
    margin: -3rem auto 3rem auto;
    box-shadow: 1px 1px #e8e8e8;
    min-height: 25rem;
    padding: 2rem 10vw 2rem 10vw;
    width: 95vw;

    @media  only screen and (max-width: 768px) {
      margin: auto;
    }
  }

  .noScroll {
    overflow: hidden;
  }

`

export default GlobalStyles

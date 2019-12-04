import { createGlobalStyle, css } from 'styled-components'

const variables = css`
  :root {
    // Colors
    --color-text-primary: #3d414c;
    --color-text-secondary: #8c8c8c;
  }
`

const GlobalStyles = createGlobalStyle`
  ${variables}

  html, body {  
    min-height: 100vh;
    margin: 0;

    font-size: 16px;
    font-family: "Droid Sans", Arial, Helvetica Neue, Helvetica, sans-serif;
    
    line-height: 1.5;
    
    background-color: #f7f7f7;
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
    padding: 0.5rem;
    margin: 0.5rem;
    border: 2px solid #8332bf;
    color: #8332bf;

    &:disabled,
    &[disabled]{
      background-color: rgba(187, 187, 187, 0.3);
      border-color: #696969 !important;
      color: #696969 !important;
      font-style: italic;
    }
    
    :hover {
      border-color: #9201fd;
      color: #9201fd;
    }

    &.success {
      border-color: #63ab52;
      color: #63ab52;

      :hover {
        border-color: #167500;
        color: #167500;
      }
    }

    &.danger {
      border-color: #ff62a2;;
      color: #ff62a2;;

      :hover {
        border-color: #ea005f;
        color: #ea005f;
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

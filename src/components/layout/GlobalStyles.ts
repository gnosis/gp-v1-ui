import { rem } from 'polished'
import { createGlobalStyle, css } from 'styled-components'

const variables = css`
  :root {
    // Colors
    --color-text-primary: #131f3e;
    --color-text-secondary: #8c8c8c;
    --color-content-bg: #fafafa;
    --color-content: #2f2f2f;
    --color-header-bg: #3340a9;
    --color-btn-border: #ff5097;

    // Layout
    --header-height: ${rem('325px')};

    // Animations
    --animation-duration: 250ms;
  }
`

const GlobalStyles = createGlobalStyle`
  ${variables}

  html {
    overflow-y: scroll;
    font-size: 16px;
    box-sizing: border-box;
  }

  body {    
    min-height: 100vh;
    margin: 0;
    font-size: 16px;
    font-family: "Droid Sans", Arial, Helvetica Neue, Helvetica, sans-serif;
    line-height: 1.5;
    background-color: var(--color-content-bg);
    color: var(--color-text-primary);
  }

  *, *:before, *:after {
    box-sizing: inherit;
  }

  a {   
    &, &:link, &:visited {
      color: var(--color-text-primary);  
    }
  }

  h1, h2, h3 {
    margin: 0;
    margin: 0.5em 0;
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
`

export default GlobalStyles

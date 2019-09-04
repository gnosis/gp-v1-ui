import { rem } from 'polished';
import { createGlobalStyle, css } from 'styled-components';

const variables = css`
  :root {
    // Colors
    --color-content-bg: #FAFAFA;
    --color-content: #2F2F2F;
    --color-header-bg: #40A4FA;
    --color-btn-border: #ff5097;

    // Layout
    --header-height: ${rem('325px')};

    // Animations
    --animation-duration: 250ms;
  }
`;

const GlobalStyles = createGlobalStyle`
  ${variables}

  html {
    box-sizing: border-box;
    overflow-y: scroll;
    font-size: 16px;
  }

  body {
    font-family: 'Open Sans', sans-serif;
    font-size: 16px;
    font-family: "Droid Sans", Arial, Helvetica Neue, Helvetica, sans-serif;
    line-height: 1.15;
    background-color: var(--color-content-bg);
  }

  *, *:before, *:after {
    box-sizing: inherit;
  }

  a {
    text-decoration: none;
    
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
  
  .content {
  }
`;

export default GlobalStyles;

import { css } from 'styled-components'

const AllColors = `
  /* HEIGHTS */
  --height-bar-default: 6.2rem;
  /* ------------------------------ */

  /* FONTS */
  --font-default: "Inter", "Helvetica Neue", Helvetica, sans-serif;
  --font-arial: Arial, Helvetica, sans-serif;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 700;
  /* ------------------------------ */
`

const DarkColors = `
  --color-primary: #1E1F2B;

  /* Gradients */
  --color-gradient-1: #21222E;
  --color-gradient-2: #2C2D3F;

  /* Borders */
  --color-border: #3A3B5A;

  /* Text */
  --color-text-primary: #ffffff;
  --color-text-secondary1: #EDEDED
  --color-text-secondary2: #9797B8;


  /* Buttons */
  --color-button-gradient: linear-gradient(270deg, #8958FF 0%, #3F77FF 100%);
  --color-button-gradient-2: linear-gradient(270deg, #8958FF 30%, #3F77FF 100%);
`

const variables = css`
  /* General styles for all themes */
  :root {
    ${AllColors}
    ${DarkColors}
  }
`

export default variables

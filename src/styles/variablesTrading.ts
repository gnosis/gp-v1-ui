import { css } from 'styled-components'

const AllColors = `
  /* FONTS */
  --font-default: "Inter", "Helvetica Neue", Helvetica, sans-serif;
  --font-mono: "Roboto Mono", monospace;
  --font-arial: Arial, Helvetica, sans-serif;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 700;
  /* ------------------------------ */
`

const DarkColors = `
  /* Background */
  --color-background: #1C1C29;
  --color-gradient-1: #21222E;
  --color-gradient-2: #2C2D3F;

  --color-background-pageWrapper: #181a1b;
  --color-background-actionCards: #0269025c;
  --color-background-highlighted: #3f4104;
  --color-background-selected: #d9d9d9;
  --color-background-selected-darker: #b6b6b6;
  --color-background-selected-dark: #2a2d2f;
  --color-background-progressBar: #4338b5;
  --color-background-input: #2a2d2f;
  --color-background-input-lighter: #404040;
  --color-background-validation-warning: #4338b5;
  --color-background-row-hover: #09233e;
  --color-background-CTA: #2e2e2e;
  --color-background-selection: #181a1b;
  --color-background-button-hover: #0B66C6;
  --color-background-button-disabled-hover: #2772c3;
  --color-background-balance-button-hover: #0B66C6;

  /* Borders */
  --color-border: #3A3B5A;

  /* Text */
  --color-text-primary: #ffffff;
  --color-text-secondary: #9797B8;

  --color-text-active: #218DFF;
  --color-text-CTA: #218DFF;
  --color-text-selection: #218DFF;
  --color-text-button-hover: #e9e9f0;

  /* Buttons */
  --color-button-primary: #1E1F2B;

  --color-button-success: #00BE2E;
  --color-button-disabled: #3d4043;
  --color-button-danger: #eb4025;
  --color-button-secondary: #696969;
  --color-button-warning: #f1851d;
  --color-modali-close: #218DFF;

  /* Components */
  --color-background-banner: #252729;
  --color-text-banner: wheat;
  --color-background-nav-active: #404040;

  /* SVGs */
  --color-svg-deposit: #218DFF;
  --color-svg-withdraw: #000;
  --color-svg-switcher: #218DFF;

  /* Shadow */
  --shadow-color: #00000047;

  /* States */
  --color-error: #cd3636;
  --color-text-deleteOrders: #bdb6b5;
  --color-background-deleteOrders: #621b1b;
`

const variables = css`
  /* General styles for all themes */
  :root {
    ${AllColors}
    ${DarkColors}
  }
`

export default variables

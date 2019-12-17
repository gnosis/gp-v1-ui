import { css } from 'styled-components'

const variables = css`
  :root {
    // ------------------------------
    // COLOURS
    //-----------------------------
    // Background
    --color-background: #f7f7f7;
    --color-background-pageWrapper: #fff;
    --color-background-actionCards: #bbfdbb;
    --color-background-highlighted: #fdffc1;

    // Text
    // --color-text-primary: #3d414c;
    --color-text-primary: #000;
    --color-text-secondary: #8c8c8c;

    // Buttons
    --color-button-primary: #000;
    --color-button-success: #5ca95c;
    --color-button-disabled: #666;
    --color-button-danger: #e55353;

    // Cards
    --color-cards-primary: #f8f8ff;

    // ------------------------------
    // BORDERS
    // ------------------------------
    --border-radius: 10px;

    // ------------------------------
    // BOX-SHADOW
    // ------------------------------
    --box-shadow: 1px 2px 2px -1px #00000047;
  }
`

export default variables

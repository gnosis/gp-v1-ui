import { css } from 'styled-components'

const variables = css`
  :root {
    // ------------------------------
    // COLOURS
    //-----------------------------
    // Background
    --color-background-lighter: #f7f7f7;
    --color-background: #eee;
    --color-background-pageWrapper: #fff;
    --color-background-actionCards: #bbfdbb;
    --color-background-highlighted: #fcfde0;
    --color-background-selected: ##d9d9d9;
    --color-background-selected-darker: #b6b6b6;
    --color-background-selected-dark: #bfbfbf;

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
    --border-radius: 0.4375rem;

    // ------------------------------
    // BOX-SHADOW
    // ------------------------------
    --box-shadow: 0.0625rem 0.125rem 0.125rem -0.0625rem #00000047;

    //-------------------------------
    // GRID
    // ------------------------------
    --grid-row-size-walletPage: minmax(10.9375rem, 1.1fr) repeat(3, 1fr) minmax(10.3125rem, 1fr);
  }
`

export default variables

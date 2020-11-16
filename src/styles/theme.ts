const white = '#FFF'
const black = '#000'

type ColourTheme = { [k: string]: string }

const LightColors = `
  /* Background */
  --color-background: #EDF2F7;
  --color-background-lighter: #f7f7f7;
  --color-background-darker: #EDF2F7;
  --color-background-pageWrapper: #fff;
  --color-background-actionCards: #bbfdbb;
  --color-background-highlighted: #fcfde0;
  --color-background-selected: #d9d9d9;
  --color-background-selected-darker: #b6b6b6;
  --color-background-selected-dark: #bfbfbf;
  --color-background-progressBar: lightskyblue;
  --color-background-input: #e7ecf3;
  --color-background-input-lighter: #ffffff;
  --color-background-validation-warning: #fff0eb;
  --color-background-row-hover: #deeeff;
  --color-background-CTA: #218DFF;
  --color-background-selection: #218DFF;
  --color-background-button-hover: #0B66C6;
  --color-background-button-disabled-hover: #2772c3;
  --color-background-balance-button-hover: #218DFF;

  /* Borders */
  --color-border: transparent;

  /* Text */
  --color-text-primary: #456483;
  --color-text-secondary: #9FB4C9;
  --color-text-active: #218DFF;
  --color-text-alternate: #456483;
  --color-text-CTA: #fff;
  --color-text-selection: #fff;
  --color-text-button-hover: #fff;

  /* Buttons */
  --color-button-primary: #000;
  --color-button-success: #5ca95c;
  --color-button-disabled: #666;
  --color-button-danger: #e55353;
  --color-button-secondary: #696969;
  --color-button-warning: #f1851d;
  --color-modali-close: #526877;

  /* Components */
  --color-background-banner: #DFE6EF;
  --color-text-wallet: #000;
  --color-text-deposit-header: #000000;
  --color-background-nav-active: #DFE6EF;
  --color-background-opaque-grey: #2f3e4e80;
  --color-text-modali: #526877;

  /* SVGs */
  --color-svg-deposit: #000;
  --color-svg-withdraw: #fff;
  --color-svg-switcher: #476481;

  /* Shadow */
  --shadow-color: #00000047;

  /* States */
  --color-error: red;
  --color-text-deleteOrders: #a71409;
  --color-background-deleteOrders: #ffd6d6;
`

const DarkColors = `
  /* Background */
  --color-background-lighter: #f7f7f7;
  --color-background: #2e2e2e;
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
  --color-border: #262626;

  /* Text */
  --color-text-primary: #a1c3e4;
  --color-text-secondary: #545454;
  --color-text-active: #218DFF;
  --color-text-CTA: #218DFF;
  --color-text-selection: #218DFF;
  --color-text-button-hover: #e9e9f0;

  /* Buttons */
  --color-button-primary: #e8e6e3;
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

const darkTheme: ColourTheme = {
  // text
  text1: '#000000',
  text2: '',

  // backgrounds / greys
  bg1: '',
  bg2: '',

  //specialty colors
  modalBG: '',
  advancedBG: '',

  //primary colors
  primary1: '',
  primary2: '',

  // color text
  primaryText1: '',

  // secondary colors
  secondary1: '',
  secondary2: '',
}

const lightTheme: ColourTheme = {
  // text
  text1: '#456483',
  text2: '#9FB4C9',

  // backgrounds / greys
  bg1: '#EDF2F7',
  bg2: '#DFE6EF',

  //specialty colors
  modalBG: '',
  advancedBG: '',

  //primary colors
  primary1: '#218DFF', // Light mode Blue (prev. button-CTA), // Dark mode dark-greyish black
  primary2: '',

  // color text
  primaryText1: '',

  // secondary colors
  secondary1: '',
  secondary2: '',
}

export const colors = (darkMode: boolean): ColourTheme => (darkMode ? darkTheme : lightTheme)

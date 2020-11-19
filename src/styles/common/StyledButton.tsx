import React from 'react'

import styled, { css, ThemeProvider } from 'styled-components'
import { ThemeMap, ThemeValue, variants } from 'styled-theming'

import ColourSheet from '../colours'
import StyleSheet from '../styles'

const {
  white,
  whiteDark,
  blue,
  blueDark,
  successLight,
  successDark,
  warningLight,
  warningDark,
  dangerLight,
  dangerDark,
  bgLight,
  bgDark,
  mainGradient,
  mainGradientDarker,
  disabledLight,
  disabledLightOpaque,
} = ColourSheet

const { buttonBorder, buttonFontSize } = StyleSheet

type AppThemes = 'dark' | 'light'
interface ThemeMode {
  mode: AppThemes
}

// Used in stories
// Good to keep around altough not required
export enum ButtonVariations {
  default = 'default',
  primary = 'primary',
  secondary = 'secondary',
  danger = 'danger',
  success = 'success',
  warning = 'warning',
  cancel = 'cancel',
  disabled = 'disabled',
  theme = 'theme',
}

// Create our variated Button Theme
// 'kind' refers to a prop on button
// <ButtonBase kind="danger" />
export const ButtonTheme = variants<'kind', keyof typeof ButtonVariations>('mode', 'kind', {
  default: {
    light: css`
      color: ${white};
      background: ${mainGradient};

      &:hover {
        background: ${mainGradientDarker};
      }
    `,
    dark: css`
      color: ${white};
      background: ${mainGradient};

      &:hover {
        background: ${mainGradientDarker};
      }
    `,
  },
  get primary() {
    return this.default
  },
  secondary: {
    light: css`
      color: ${blue};
      background: ${bgLight};
      border-color: ${blue};

      &:hover {
        background: ${bgDark};
      }
    `,
    dark: css`
      color: ${blue};
      background: ${bgDark};
      border-color: ${blue};

      &:hover {
        color: ${white};
        background: ${blue};
      }
    `,
  },
  success: {
    light: css`
      color: ${white};
      background: ${successLight};

      &:hover {
        background: ${successDark};
        border-color: ${successDark};
      }
    `,
    dark: css`
      color: ${white};
      background: ${successDark};

      &:hover {
        background: ${successLight};
        border-color: ${successLight};
      }
    `,
  },
  danger: {
    light: css`
      color: ${white};
      background: ${dangerLight};

      &:hover {
        background: ${dangerDark};
        border-color: ${dangerDark};
      }
    `,
    dark: css`
      color: ${white};
      background: ${dangerDark};

      &:hover {
        background: ${dangerLight};
        border-color: ${dangerLight};
      }
    `,
  },
  warning: {
    light: css`
      color: ${white};
      background: ${warningLight};

      &:hover {
        background: ${warningDark};
        border-color: ${warningDark};
      }
    `,
    dark: css`
      color: ${white};
      background: ${warningDark};

      &:hover {
        background: ${warningLight};
        border-color: ${warningLight};
      }
    `,
  },
  cancel: {
    light: css`
      color: ${white};
      background: transparent;

      &:hover {
        background: ${blueDark};
      }
    `,
    dark: css`
      color: ${blue};
      background: transparent;

      &:hover {
        color: ${whiteDark};
        background: ${blueDark};
      }
    `,
  },
  disabled: {
    dark: css`
      color: ${disabledLightOpaque};
      background: ${disabledLight};
    `,
    get light(): ThemeValue {
      return this.dark
    },
  },
  theme: {
    light: css`
      color: ${white};
      background: lightsalmon;

      &:hover {
        color: ghostwhite;
        background: darkorange;
      }
    `,
    dark: css`
      color: ghostwhite;
      background: purple;

      &:hover {
        color: ${white};
        background: darkpurple;
      }
    `,
  },
})

// Created a 'size' prop on buttons, default | small | big
const ButtonSizes = variants('component', 'size', {
  default: {
    buttons: '',
  },
  small: {
    buttons: css`
      font-size: 0.6rem;
      padding: 0.3rem 0.5rem;
    `,
  },
  big: {
    buttons: css`
      font-size: 1.4rem;
      padding: 0.65rem 1rem;
    `,
  },
})

const ColouredButtonBase = styled.button`
  border: ${buttonBorder};
  /* Fold in theme css above */
  ${ButtonTheme}
`

const ColouredAndSizedButtonBase = styled(ColouredButtonBase)`
  font-size: ${buttonFontSize};
  ${ButtonSizes}
`
// Wrap ColouredAndSizedButtonsBase in it's own ThemeProvider which takes the toplevel app theme
// ThemeProvider and interpolate over it's props
const ThemedButtonBase: React.FC<React.ButtonHTMLAttributes<Element>> = (props) => (
  <ThemeProvider theme={({ mode }: ThemeMode): ThemeMap => ({ mode, component: 'buttons' })}>
    <ColouredAndSizedButtonBase {...props} />
  </ThemeProvider>
)

export default ThemedButtonBase

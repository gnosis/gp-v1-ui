import styled, { css } from 'styled-components'
import { variants } from 'styled-theming'

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
} = ColourSheet

const { buttonBorder } = StyleSheet

// Used in stories
// Good to keep around altough not required
export enum ButtonVariations {
  default,
  primary,
  secondary,
  danger,
  success,
  warning,
  cancel,
  theme,
}

// Create our variated Button Theme
// 'kind' refers to a prop on button
// <ButtonBase kind="danger" />
export const ButtonTheme = variants<'kind', keyof typeof ButtonVariations>('mode', 'kind', {
  default: {
    light: css`
      color: ${white};
      background-color: ${blue};

      &:hover {
        background-color: ${blueDark};
      }
    `,
    dark: css`
      color: ${blue};
      background-color: ${bgDark};

      &:hover {
        color: ${white};
        background-color: ${blueDark};
      }
    `,
  },
  get primary() {
    return this.default
  },
  secondary: {
    light: css`
      color: ${blue};
      background-color: ${bgLight};
      border-color: ${blue};

      &:hover {
        background-color: ${bgDark};
      }
    `,
    dark: css`
      color: ${blue};
      background-color: ${bgDark};
      border-color: ${blue};

      &:hover {
        color: ${white};
        background-color: ${blue};
      }
    `,
  },
  success: {
    light: css`
      color: ${white};
      background-color: ${successLight};

      &:hover {
        background-color: ${successDark};
        border-color: ${successDark};
      }
    `,
    dark: css`
      color: ${white};
      background-color: ${successDark};

      &:hover {
        background-color: ${successLight};
        border-color: ${successLight};
      }
    `,
  },
  danger: {
    light: css`
      color: ${white};
      background-color: ${dangerLight};

      &:hover {
        background-color: ${dangerDark};
        border-color: ${dangerDark};
      }
    `,
    dark: css`
      color: ${white};
      background-color: ${dangerDark};

      &:hover {
        background-color: ${dangerLight};
        border-color: ${dangerLight};
      }
    `,
  },
  warning: {
    light: css`
      color: ${white};
      background-color: ${warningLight};

      &:hover {
        background-color: ${warningDark};
        border-color: ${warningDark};
      }
    `,
    dark: css`
      color: ${white};
      background-color: ${warningDark};

      &:hover {
        background-color: ${warningLight};
        border-color: ${warningLight};
      }
    `,
  },
  cancel: {
    light: css`
      color: ${white};
      background: transparent;

      &:hover {
        background-color: ${blueDark};
      }
    `,
    dark: css`
      color: ${blue};
      background: transparent;

      &:hover {
        color: ${whiteDark};
        background-color: ${blueDark};
      }
    `,
  },
  theme: {
    light: css`
      color: ${white};
      background: lightsalmon;

      &:hover {
        color: ghostwhite;
        background-color: darkorange;
      }
    `,
    dark: css`
      color: ghostwhite;
      background: purple;

      &:hover {
        color: ${white};
        background-color: darkpurple;
      }
    `,
  },
})

export default styled.button`
  border: ${buttonBorder};

  /* Fold in theme css above */
  ${ButtonTheme}
`

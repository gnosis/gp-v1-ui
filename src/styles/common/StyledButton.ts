import styled, { css } from 'styled-components'
import { ThemeValue, variants } from 'styled-theming'

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

const { buttonBorder } = StyleSheet

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

/*
TODO: consider adding:
  &.small {
    font-size: 0.6rem;
    padding: 0.3rem 0.5rem;
  }

  &.big {
    font-size: 1.2rem;
    padding: 0.65rem 1rem;
  }
*/

export default styled.button`
  border: ${buttonBorder};

  /* Fold in theme css above */
  ${ButtonTheme}
`

export type Color = string
export interface Colors {
  // text
  primaryText1: Color
  secondaryText1: Color
  secondaryText2: Color
  textDisabled: Color

  // backgrounds / greys
  bg1: Color
  bg2: Color
  bgDisabled: Color

  // gradients
  gradient1: Color
  gradient2: Color

  // Base
  white: Color
  black: Color
  red1: Color
  red2: Color
  red3?: Color
  green1: Color
  green2: Color
  green3?: Color
  yellow1: Color
  yellow2: Color
  yellow3?: Color
  blue1: Color
  blue2: Color
  blue3?: Color
}

export enum Theme {
  AUTO = 'AUTO',
  DARK = 'DARK',
  LIGHT = 'LIGHT',
}

export const THEME_LIST = Object.entries(Theme)

declare module 'styled-components' {
  export interface DefaultTheme extends Colors {
    // theming
    mode: Theme
    // used to key in on component variants
    components?: keyof JSX.IntrinsicElements | React.ComponentType<Record<string, unknown>>
  }
}

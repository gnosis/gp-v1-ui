import { Colors } from 'theme/types'

export const BASE_COLOURS: Partial<Colors> = {
  // base
  white: '#FFF',
  black: '#000',
  red1: '#FF305B',
  red2: '#FF6871',
  red3: '#F82D3A',
  green1: '#00C46E',
  green2: '#09371d',
  green3: '#a9ffcd',
  yellow1: '#f1851d',
  yellow2: '#f1851d',
  blue1: '#2172E5',
  blue2: '#3F77FF',
}

export const LIGHT_COLOURS: Partial<Colors> = {
  // text
  primaryText1: BASE_COLOURS.white,
  secondaryText1: '#EDEDED',
  secondaryText2: '#9797B8',
  textDisabled: '#31323E',

  // backgrounds / greys
  bg1: '#ffc1ff',
  bg2: '#F7F8FA',
  bgDisabled: '#ffffff80',

  // gradients
  gradient1: '#8958FF',
  gradient2: '#3F77FF',
}

export const DARK_COLOURS: Partial<Colors> = {
  // text
  primaryText1: BASE_COLOURS.white,
  secondaryText1: '#EDEDED',
  secondaryText2: '#9797B8',
  textDisabled: '#31323E',

  // backgrounds / greys
  bg1: '#212429',
  bg2: '#2C2F36',
  bgDisabled: '#ffffff80',

  // gradients
  gradient1: '#8958FF',
  gradient2: '#3F77FF',

  // TODO: add to theme, not colour palette
  // gradientForm1: 'linear-gradient(270deg, #8958FF 0%, #3F77FF 100%)',
  // gradientForm2: 'linear-gradient(270deg, #8958FF 30%, #3F77FF 100%)',
}

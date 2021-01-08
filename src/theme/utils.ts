import { Theme, Colors, LIGHT_COLOURS, DARK_COLOURS, BASE_COLOURS } from 'theme'

export function getThemePalette(colourTheme: Theme): Colors {
  let THEME_COLOURS = LIGHT_COLOURS

  switch (colourTheme) {
    case Theme.LIGHT:
      THEME_COLOURS = LIGHT_COLOURS
      break
    case Theme.DARK:
      THEME_COLOURS = DARK_COLOURS
      break
    default:
      THEME_COLOURS = DARK_COLOURS
  }
  return {
    ...BASE_COLOURS,
    ...THEME_COLOURS,
  }
}

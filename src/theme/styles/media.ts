export const MEDIA_QUERIES = {
  MOBILE_LARGE_PX: 500,
  tinyScreen: '320px',
  xSmallScreen: '430px',
  smallScreen: '736px',
  smallScreenUp: '737px',
  mediumScreenSmall: '850px',
  mediumEnd: '1024px',
  desktopScreen: '1025px',
  desktopScreenLarge: '1366px',
  get tinyDown(): string {
    return `only screen and (max-width : ${this.tinyScreen})`
  },
  get xSmallDown(): string {
    return `only screen and (max-width : ${this.xSmallScreen})`
  },
  get mobile(): string {
    return `only screen and (max-width : ${this.smallScreen})`
  },
  get mediumUp(): string {
    return `only screen and (min-width : ${this.smallScreenUp})`
  },
  get mediumDown(): string {
    return `only screen and (max-width : ${this.mediumEnd})`
  },
  get mediumOnly(): string {
    return `only screen and (min-width : ${this.smallScreenUp}) and (max-width : ${this.mediumEnd})`
  },
  get desktop(): string {
    return `only screen and (min-width : ${this.desktopScreen})`
  },
  get desktopLarge(): string {
    return `only screen and (min-width: ${this.desktopScreenLarge})`
  },
  get tabletPortrait(): string {
    return `(min-device-width: ${this.smallScreenUp}) and (max-device-width: ${this.mediumEnd}) and (orientation: portrait)`
  },
  get tabletLandscape(): string {
    return `(min-device-width: ${this.smallScreenUp}) and (max-device-width: ${this.mediumEnd}) and (orientation: landscape)`
  },
  get tablet(): string {
    return `(min-width: ${this.smallScreenUp}) and (max-width: ${this.mediumEnd}), ${this.tabletPortrait}, ${this.tabletLandscape}`
  },
  get tabletNoPortrait(): string {
    return `(min-width: ${this.smallScreenUp}) and (max-width: ${this.mediumEnd}), ${this.tabletLandscape}`
  },
  get tabletSmall(): string {
    return `(min-width: ${this.smallScreenUp}) and (max-width: ${this.mediumScreenSmall})`
  },
}

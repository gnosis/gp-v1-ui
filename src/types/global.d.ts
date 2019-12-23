declare let VERSION: string
declare let DEX_JS_VERSION: string
declare let CONTRACT_VERSION: string

declare module '*.svg' {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const content: any
  export default content
}

declare module '*.png' {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const value: any
  export default value
}

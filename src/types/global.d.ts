declare var VERSION: string

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

declare module '*.json' {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const content: any
  export default content
}

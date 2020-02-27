export const validInputPattern = new RegExp(/^\d+\.?\d*$/) // allows leading and trailing zeros

export function preventInvalidChars(event: React.KeyboardEvent<HTMLInputElement>): void {
  if (
    event.key !== 'Backspace' &&
    event.key !== 'Delete' &&
    !validInputPattern.test(event.currentTarget.value + event.key)
  ) {
    event.preventDefault()
  }
}

export function validatePositive(value: string, constraint = 0): true | string {
  return Number(value) > constraint || 'Invalid amount'
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from 'toastify'

export function onErrorFactory(msg?: string): (error: any) => Promise<void> {
  const errorMsg = msg ? msg : 'An error has occurred'

  return async (error: any): Promise<void> => {
    console.error(error)
    toast.error(errorMsg)
  }
}

import { Toast } from 'react-toastify'

type ToastMethods = Exclude<keyof Toast, 'TYPE' | 'POSITION'>

const methods: ToastMethods[] = [
  'success',
  'info',
  'warn',
  'error',
  'isActive',
  'dismiss',
  'update',
  'onChange',
  'done',
  'configure',
]

type ToastPromised = {
  [K in ToastMethods]: (...args: Parameters<Toast[K]>) => Promise<ReturnType<Toast[K]>>
}

const properties = methods.reduce((accum, method) => {
  accum[method] = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get: (): any => (...args: [any, any]): Promise<any> =>
      import(
        /* webpackChunkName: "toastify"*/
        './setupToastify'
      ).then(({ toast }) => toast[method](...args)),
  }
  return accum
}, {}) as {
  [K in ToastMethods]: ToastPromised[K]
}

const toastFunc = (...args: Parameters<Toast>): Promise<ReturnType<Toast>> =>
  import(
    /* webpackChunkName: "toastify"*/
    './setupToastify'
  ).then(({ toast }) => toast(...args))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const toast = Object.defineProperties(toastFunc, properties as any) as ToastPromised

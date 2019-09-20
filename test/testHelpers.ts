export * from './data'
import { DATE } from './data'

export function mockTimes(): void {
  jest.spyOn(global.Date, 'now').mockImplementation(() => DATE.valueOf())
}

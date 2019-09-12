import { BATCH_TIME } from 'constants/'

export const DATE: Date = new Date('2017-04-23T08:30:15.500Z') // Epoch: 1492936215500 mills
export const DATE_EPOCH = Math.floor(DATE.valueOf() / 1000) // 1492936215 sec
export const BATCH_NUMBER = Math.floor(DATE_EPOCH / BATCH_TIME) // Math.floor(1492936215 / 300) = 4976454
export const BATCH_SECOND = DATE_EPOCH % BATCH_TIME // 1492936215 % 300 = 15

export function mockTimes(): void {
  jest.spyOn(global.Date, 'now').mockImplementation(() => DATE.valueOf())
}
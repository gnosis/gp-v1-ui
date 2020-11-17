import Joi from 'joi'
import { DEFAULT_PRECISION, BATCH_TIME } from '@gnosis.pm/dex-js'
import { VALIDATOR_ERROR_KEYS, addYears } from 'utils'
import { BATCH_TIME_IN_MS } from 'const'

const { BASE, REQUIRED, GREATER, DATE_MIN, DATE_MAX, MULTIPLE } = VALIDATOR_ERROR_KEYS
// 15 minutes
export const BATCH_START_THRESHOLD = 3
// 5 minutes
export const BATCH_END_THRESHOLD = 1

const validitySchema = Joi.object({
  relativeTime: Joi.date().default(Date.now),
  validFrom: Joi.date()
    .min(Joi.ref('relativeTime', { adjust: (now) => now + BATCH_TIME_IN_MS * BATCH_START_THRESHOLD }))
    .max(Joi.ref('relativeTime', { adjust: (now) => addYears(now, 1) }))
    .messages({
      [BASE]: 'Invalid time',
      [DATE_MIN]: `Select a start time no earlier than ${
        (BATCH_TIME / 60) * BATCH_START_THRESHOLD
      } minutes in the future, or select "Now" to place your order as soon as possible`,
      [DATE_MAX]: `Select a start time/batch no later than 1 year in the future`,
      [MULTIPLE]: 'Time must be a multiple of 5',
    }),
  validUntil: Joi.date()
    // validUntil validFrom's batchId + 1 (5 min)
    // otherwise if validFrom is null === NOW then validFrom is 5 min from Date.now()
    .when('validFrom', {
      is: Joi.date().required(),
      then: Joi.date()
        .min(Joi.ref('validFrom', { adjust: (val) => +val + BATCH_TIME_IN_MS * BATCH_END_THRESHOLD }))
        .max(Joi.ref('relativeTime', { adjust: (now) => addYears(now, 5) })),
      otherwise: Joi.date()
        .min('now')
        .max(Joi.ref('relativeTime', { adjust: (now) => addYears(now, 5) })),
    })
    .messages({
      [BASE]: 'Invalid time',
      [DATE_MIN]: `Select an expiration time at least ${
        (BATCH_TIME / 60) * BATCH_END_THRESHOLD
      } minutes later than your selected starting time`,
      [DATE_MAX]: `Select an expiration time/batch no later than 5 years in the future`,
      [MULTIPLE]: 'Time must be a multiple of 5',
    }),
})

const schema = Joi.object({
  sellToken: Joi.number()
    .unsafe()
    .precision(DEFAULT_PRECISION)
    .greater(0)
    .required()
    .messages({
      [BASE]: 'Invalid sell amount',
      [REQUIRED]: 'Invalid sell amount',
      [GREATER]: 'Invalid sell amount',
    }),
  receiveToken: Joi.number()
    .unsafe()
    .greater(0)
    .required()
    .messages({
      [BASE]: 'Invalid receive amount',
      [REQUIRED]: 'Invalid receive amount',
      [GREATER]: 'Invalid receive amount: adjust order parameters',
    }),
  price: Joi.number()
    // allow unsafe JS numbers
    .unsafe()
    .precision(DEFAULT_PRECISION)
    .greater(0)
    // key value cannot be undefined
    .required()
    .messages({
      [REQUIRED]: 'Invalid price',
      [GREATER]: 'Invalid price',
    }),
  priceInverse: Joi.number()
    .unsafe()
    .precision(DEFAULT_PRECISION)
    .greater(0)
    .required()
    .messages({
      [BASE]: 'Invalid price',
      [REQUIRED]: 'Invalid price',
      [GREATER]: 'Invalid price',
    }),
}).concat(validitySchema)

export { schema as default, validitySchema }

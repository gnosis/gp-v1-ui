import Joi from 'joi'
import { DEFAULT_PRECISION, BATCH_TIME } from '@gnosis.pm/dex-js'
import { NUMBER_VALIDATION_KEYS } from 'utils'
import { BATCH_TIME_IN_MS } from 'const'

const { BASE, REQUIRED, GREATER, DATE_MIN, MULTIPLE } = NUMBER_VALIDATION_KEYS
// 15 minutes
export const BATCH_START_THRESHOLD = 3
// 5 minutes
export const BATCH_END_THRESHOLD = 1

const validitySchema = Joi.object({
  relativeTime: Joi.date().default(Date.now),
  validFrom: Joi.date()
    .min(Joi.ref('relativeTime', { adjust: (now) => now + BATCH_TIME_IN_MS * BATCH_START_THRESHOLD }))
    .messages({
      [BASE]: 'Invalid time',
      [DATE_MIN]: `Please select a time greater than ${
        (BATCH_TIME / 60) * BATCH_START_THRESHOLD
      } minutes in the future`,
      [MULTIPLE]: 'Time must be a multiple of 5',
    }),
  validUntil: Joi.date()
    // validUntil validFrom's batchId + 1 (5 min)
    // otherwise if validFrom is null === NOW then validFrom is 5 min from Date.now()
    .when('validFrom', {
      is: Joi.date().required(),
      then: Joi.date().min(Joi.ref('validFrom', { adjust: (val) => +val + BATCH_TIME_IN_MS * BATCH_END_THRESHOLD })),
      otherwise: Joi.date().min('now'),
    })
    .messages({
      [BASE]: 'Invalid time',
      [DATE_MIN]: `Expiration time must at least ${
        (BATCH_TIME / 60) * BATCH_END_THRESHOLD
      } minutes later than selected starting time`,
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
  receiveToken: Joi.number().unsafe().optional(),
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

import Joi from '@hapi/joi'
import { DEFAULT_PRECISION } from '@gnosis.pm/dex-js'
import { NUMBER_VALIDATION_KEYS } from 'utils'

const { BASE, REQUIRED, GREATER, MIN, MULTIPLE, INTEGER } = NUMBER_VALIDATION_KEYS

export default Joi.object({
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
    .optional(),
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
  validFrom: Joi.number()
    // no floating points
    .integer()
    .multiple(5)
    .min(15)
    .messages({
      [BASE]: 'Invalid time',
      [INTEGER]: 'Invalid time',
      [MIN]: 'Time must be greater than or equal to 15',
      [MULTIPLE]: 'Time must be a multiple of 5',
    }),
  validUntil: Joi.number()
    // no floating points
    .integer()
    .multiple(5)
    .min(5)
    .messages({
      [BASE]: 'Invalid time',
      [INTEGER]: 'Invalid time',
      [MIN]: 'Time must be greater than or equal to 5',
      [MULTIPLE]: 'Time must be a multiple of 5',
    }),
})

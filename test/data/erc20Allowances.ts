import { ZERO, ALLOWANCE_VALUE } from 'const'
import { USER_1, TOKEN_1, CONTRACT, TOKEN_2, TOKEN_3, TOKEN_4, TOKEN_5, TOKEN_6, TOKEN_7 } from './basic'
import { AMOUNT, AMOUNT_SMALL } from './basic'

export default {
  [USER_1]: {
    [TOKEN_1]: {
      [CONTRACT]: ZERO,
    },
    [TOKEN_2]: {
      [CONTRACT]: ALLOWANCE_VALUE,
    },
    [TOKEN_3]: {
      [CONTRACT]: ALLOWANCE_VALUE,
    },
    [TOKEN_4]: {
      [CONTRACT]: AMOUNT,
    },
    [TOKEN_5]: {
      [CONTRACT]: AMOUNT_SMALL,
    },
    [TOKEN_6]: {
      [CONTRACT]: ALLOWANCE_VALUE,
    },
    [TOKEN_7]: {
      [CONTRACT]: ZERO,
    },
  },
}

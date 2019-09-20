import BN from 'bn.js'
import { ZERO } from 'const'

import { USER_1, TOKEN_1, TOKEN_2, TOKEN_3, TOKEN_4, TOKEN_5, TOKEN_6 } from './basic'
import { BalancesByUserAndToken } from 'api/exchange/DepositApiMock'

const FLUX_ZERO = {
  amount: ZERO,
  stateIndex: 0,
}

const STATE_ZERO = {
  balance: ZERO,
  pendingDeposits: FLUX_ZERO,
  pendingWithdraws: FLUX_ZERO,
}

const exchangeBalanceStates: BalancesByUserAndToken = {
  [USER_1]: {
    [TOKEN_1]: STATE_ZERO,
    [TOKEN_2]: {
      balance: new BN('1750173903215790623569'), // 1,750.07
      pendingDeposits: {
        amount: new BN('850000000000000000'), // 0.85,
        stateIndex: 1,
      },
      pendingWithdraws: FLUX_ZERO,
    },
    [TOKEN_3]: {
      balance: new BN('500000000000000000'), // 0.5
      pendingDeposits: FLUX_ZERO,
      pendingWithdraws: {
        amount: new BN('100000000000000000'), // 0.1,
        stateIndex: 1,
      },
    },
    [TOKEN_4]: STATE_ZERO,
    [TOKEN_5]: STATE_ZERO,
    [TOKEN_6]: {
      balance: new BN('50048296532871266216000'), // 500,482.96
      pendingDeposits: FLUX_ZERO,
      pendingWithdraws: {
        amount: new BN('101479327327532326732'), // 1,
        stateIndex: Number.MAX_SAFE_INTEGER,
      },
    },
  },
}

export default exchangeBalanceStates

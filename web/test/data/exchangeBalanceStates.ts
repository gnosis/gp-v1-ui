import BN from 'bn.js'
import { ZERO } from 'const'

import { USER_1, TOKEN_1, TOKEN_2, TOKEN_3, TOKEN_4, TOKEN_5, TOKEN_6, TOKEN_7 } from './basic'
import { BalancesByUserAndToken } from 'api/deposit/DepositApiMock'
import { PendingFlux } from 'api/deposit/DepositApi'

// Using a function to build flux objects because if we use the same
// object everywhere, anytime it's updated, it'll reflect everywhere
export const createFlux = (amount: BN = ZERO, batchId = 0): PendingFlux => {
  return { amount, batchId }
}

const STATE_ZERO = {
  balance: ZERO,
  pendingDeposits: createFlux(),
  pendingWithdraws: createFlux(),
}

export const exchangeBalanceStates: BalancesByUserAndToken = {
  [USER_1]: {
    [TOKEN_1]: STATE_ZERO, // 0. WETH: decimals=18
    [TOKEN_2]: {
      // 0. USDT: decimals=6
      balance: new BN('1750173903'), // 1,750.17
      pendingDeposits: {
        amount: new BN('850000'), // 0.85,
        batchId: 1,
      },
      pendingWithdraws: createFlux(),
    },
    [TOKEN_3]: {
      // 0. TUSD: decimals=18
      balance: new BN('500000000000000000'), // 0.5
      pendingDeposits: createFlux(),
      pendingWithdraws: {
        amount: new BN('100000000000000000'), // 0.1,
        batchId: 1,
      },
    },
    [TOKEN_4]: STATE_ZERO, // 0. USDC: decimals=6
    [TOKEN_5]: {
      // 0. PAX: decimals=18
      balance: new BN('100144563322323'), // 50,048.29
      pendingDeposits: createFlux(),
      pendingWithdraws: createFlux(),
    },
    [TOKEN_6]: {
      // 0. GUSD: decimals=2
      balance: new BN('5004829'), // 50,048.29
      pendingDeposits: createFlux(),
      pendingWithdraws: {
        amount: new BN('10147'), // 101.47
        batchId: Number.MAX_SAFE_INTEGER,
      },
    },
    // @ts-ignore
    [TOKEN_7]: undefined, // 0. DAI: decimals=18
  },
}

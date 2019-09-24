import BN from 'bn.js'
import { ZERO } from 'const'
import { USER_1, TOKEN_1, TOKEN_2, TOKEN_3, TOKEN_4, TOKEN_5, TOKEN_6, TOKEN_7 } from './basic'

export default {
  [USER_1]: {
    [TOKEN_1]: new BN('20567000000000000000'), // 20.56, WETH: decimals=18
    [TOKEN_2]: new BN('725683288'), // 725.68, USDT: decimals=6
    [TOKEN_3]: new BN('50200000000000000000'), // 50.20, TUSD: decimals=18
    [TOKEN_4]: ZERO, // USDC: decimals=6
    [TOKEN_5]: ZERO, // PAX: decimals=18
    [TOKEN_6]: new BN('1000'), // 0.001, GUSD: decimals=6
    [TOKEN_7]: undefined, // 0, DAI: decimals=18
  },
}

import BN from 'bn.js'
import { ZERO } from 'const'
import { USER_1, TOKEN_1, TOKEN_2, TOKEN_3, TOKEN_4, TOKEN_5, TOKEN_6 } from './basic'

export default {
  [USER_1]: {
    [TOKEN_1]: new BN('20567000000000000000'), // 20.56
    [TOKEN_2]: new BN('725683288392363263268'), // 725.68
    [TOKEN_3]: new BN('50200000000000000000'), // 50.20
    [TOKEN_4]: ZERO,
    [TOKEN_5]: ZERO,
    [TOKEN_6]: new BN('1000000000000000'), // 0.001
  },
}

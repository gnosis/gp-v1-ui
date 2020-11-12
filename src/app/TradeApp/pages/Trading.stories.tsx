// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Meta } from '@storybook/react/types-6-0'

import { Trading } from './Trading'

export default {
  title: 'TradeApp/Trading',
  component: Trading,
} as Meta

export const Primary = Trading

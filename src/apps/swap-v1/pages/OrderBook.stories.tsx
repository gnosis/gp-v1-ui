// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Meta } from '@storybook/react/types-6-0'
import OrderBookPage from './OrderBook'

export default {
  title: 'Pages/OrderBook',
  component: OrderBookPage,
} as Meta

export const Primary = OrderBookPage

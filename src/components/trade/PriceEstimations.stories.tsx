import React from 'react'
// import { Price } from 'components/trade/PriceP'
import { useForm, FormProvider } from 'react-hook-form'

// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Meta, Story } from '@storybook/react/types-6-0'
import { PriceEstimations, Props } from './PriceEstimations'

export default {
  title: 'Trade/PriceEstimations',
} as Meta

const Template: Story<Props> = (props) => {
  const methods = useForm()
  return (
    <FormProvider {...methods}>
      <form>
        <PriceEstimations {...props} />
      </form>
    </FormProvider>
  )
}

export const Basic = Template.bind({})
Basic.args = {
  networkId: 1,
  baseToken: {
    id: 1,
    address: '0x1',
    symbol: 'GNO',
  },
  quoteToken: {
    id: 2,
    address: '0x2',
    symbol: 'DAI',
  },
  amount: '100',
  isPriceInverted: true,
}

// // FIXME: It looks like it allows to use this component with no argument, but then it fails to render
// export const NoArgs = Template.bind({})
// NoArgs.args = {}

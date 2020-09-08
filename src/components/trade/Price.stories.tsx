import React from 'react'
// import { Price } from 'components/trade/PriceP'
import { useForm, FormProvider } from 'react-hook-form'

// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Meta, Story } from '@storybook/react/types-6-0'
import { Price, Props } from './Price'
import { GNO, DAI } from 'storybook/tokens'

export default {
  title: 'Trade/Price',
  component: Price,
} as Meta

const Template: Story<Props> = (props) => {
  const methods = useForm()
  return (
    <FormProvider {...methods}>
      <form>
        <Price {...props} />
      </form>
    </FormProvider>
  )
}

export const Basic = Template.bind({})
Basic.args = {
  sellToken: GNO,
  receiveToken: DAI,
}

// // FIXME: It looks like it allows to use this component with no argument, but then it fails to render
// export const NoArgs = Template.bind({})
// NoArgs.args = {}

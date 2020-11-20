import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'

import { ThemeToggler } from 'storybook/decorators'

import { ButtonBase, ButtonBaseProps } from './'

export default {
  title: 'Common/Button',
  component: ButtonBase,
  decorators: [ThemeToggler],
  argTypes: {
    label: { control: 'text' },
    _type: { control: 'radio' },
    _size: { control: 'inline-radio' },
    as: { control: null },
    theme: { control: null },
    forwardedAs: { control: null },
  },
} as Meta

const Template: Story<ButtonBaseProps & { label?: React.ReactNode }> = (args) => (
  <ButtonBase {...args}>{args.label}</ButtonBase>
)

export const PrimaryButton = Template.bind({})
PrimaryButton.args = {
  label: 'Main Button',
  _type: 'default',
}

export const SecondaryButton = Template.bind({})
SecondaryButton.args = {
  label: 'Secondary Button',
  _type: 'secondary',
}

export const SuccessButton = Template.bind({})
SuccessButton.args = {
  label: 'Success Button',
  _type: 'success',
}

export const WarningButton = Template.bind({})
WarningButton.args = {
  label: 'Warning Button',
  _type: 'warning',
}

export const DangerButton = Template.bind({})
DangerButton.args = {
  label: 'Danger Button',
  _type: 'danger',
}

export const CancelButton = Template.bind({})
CancelButton.args = {
  label: 'Cancel Button',
  _type: 'cancel',
}

export const DisabledButton = Template.bind({})
DisabledButton.args = {
  label: 'Disabled Button',
  _type: 'disabled',
  disabled: true,
}

export const BigButton = Template.bind({})
BigButton.args = {
  label: 'Big Button',
  _type: 'primary',
  _size: 'big',
}

export const SmolButton = Template.bind({})
SmolButton.args = {
  label: 'Smol Button',
  _type: 'primary',
  _size: 'small',
}

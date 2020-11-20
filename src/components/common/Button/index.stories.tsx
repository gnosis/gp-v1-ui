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
    $type: { control: 'radio' },
    $size: { control: 'inline-radio' },
    as: { control: null },
    theme: { control: null },
    forwardedAs: { control: null },
  },
} as Meta

const Template: Story<ButtonBaseProps & { label?: string | React.ReactNode }> = (args) => (
  <ButtonBase {...args}>{args.label}</ButtonBase>
)

export const PrimaryButton = Template.bind({})
PrimaryButton.args = {
  label: 'Main Button',
  $type: 'default',
}

export const SecondaryButton = Template.bind({})
SecondaryButton.args = {
  label: 'Secondary Button',
  $type: 'secondary',
}

export const SuccessButton = Template.bind({})
SuccessButton.args = {
  label: 'Success Button',
  $type: 'success',
}

export const WarningButton = Template.bind({})
WarningButton.args = {
  label: 'Warning Button',
  $type: 'warning',
}

export const DangerButton = Template.bind({})
DangerButton.args = {
  label: 'Danger Button',
  $type: 'danger',
}

export const CancelButton = Template.bind({})
CancelButton.args = {
  label: 'Cancel Button',
  $type: 'cancel',
}

export const DisabledButton = Template.bind({})
DisabledButton.args = {
  label: 'Disabled Button',
  $type: 'disabled',
  disabled: true,
}

export const BigButton = Template.bind({})
BigButton.args = {
  label: 'Big Button',
  $type: 'primary',
  $size: 'big',
}

export const SmolButton = Template.bind({})
SmolButton.args = {
  label: 'Smol Button',
  $type: 'primary',
  $size: 'small',
}

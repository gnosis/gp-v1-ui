import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'

import { DarkModeThemeToggler } from 'storybook/decorators'

import { ButtonBase } from './'
import { ButtonVariations } from 'styles/common/StyledButton'

export default {
  title: 'Common/Button',
  component: ButtonBase,
  decorators: [DarkModeThemeToggler],
  argTypes: {
    label: { control: 'text' },
    kind: { control: 'inline-radio', options: ButtonVariations },
    as: {
      control: null,
    },
    theme: { control: null },
    forwardedAs: {
      control: null,
    },
  },
} as Meta

const Template: Story = (args) => <ButtonBase {...args}>{args.label}</ButtonBase>

export const PrimaryButton = Template.bind({})
PrimaryButton.args = {
  label: 'Main Button',
  kind: 'default',
}

export const SecondaryButton = Template.bind({})
SecondaryButton.args = {
  label: 'Secondary Button',
  kind: 'secondary',
}

export const SuccessButton = Template.bind({})
SuccessButton.args = {
  label: 'Success Button',
  kind: 'success',
}

export const WarningButton = Template.bind({})
WarningButton.args = {
  label: 'Warning Button',
  kind: 'warning',
}

export const DangerButton = Template.bind({})
DangerButton.args = {
  label: 'Danger Button',
  kind: 'danger',
}

export const CancelButton = Template.bind({})
CancelButton.args = {
  label: 'Cancel Button',
  kind: 'cancel',
}

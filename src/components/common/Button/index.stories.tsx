import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import { ButtonBase, ButtonBaseProps } from '.'
import { DarkModeThemeToggler } from 'storybook/decorators'

export default {
  title: 'Common/Button',
  component: ButtonBase,
  decorators: [DarkModeThemeToggler],
  argTypes: {
    label: { control: 'text' },
    theme: {
      control: null,
    },
    as: {
      control: null,
    },
    forwardedAs: {
      control: null,
    },
  },
} as Meta

const Template: Story<ButtonBaseProps & { label: string | React.ReactNode }> = (args) => (
  <ButtonBase {...args}>{args.label}</ButtonBase>
)

export const PrimaryButton = Template.bind({})
PrimaryButton.args = {
  label: 'Main Button',
}

export const SecondaryButton = Template.bind({})
SecondaryButton.args = {
  label: 'SecondaryButton',
  $alt: true,
  $border: true,
}

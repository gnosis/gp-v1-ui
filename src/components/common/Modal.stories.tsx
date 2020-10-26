import React from 'react'
import { action } from '@storybook/addon-actions'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'
import Modal, { ModalOptions, ModalProps, useModal } from 'components/common/Modal'
import { LoremIpsum } from 'storybook/LoremIpsum'

const { Modal: ModalComponent } = Modal

export default {
  title: 'Common/Modal',
  component: ModalComponent,
} as Meta

const Template: Story<{ props: ModalProps; options?: ModalOptions }> = (args) => {
  const [modalHook, toggleModal] = useModal(args.options)
  return (
    <>
      <button onClick={toggleModal}>Open Modal</button>
      <ModalComponent {...args} {...modalHook} />
    </>
  )
}

const LoremDefaultModalOptions = {
  title: 'Lorem Ipsum',
  message: (
    <div style={{ height: '20rem', overflowY: 'auto' }}>
      <LoremIpsum />
    </div>
  ),
}

export const LoremOneButton = Template.bind({})
LoremOneButton.args = {
  options: {
    ...LoremDefaultModalOptions,
    buttons: [
      <>&nbsp;</>,
      <Modal.Button label="Close" key="yes" isStyleDefault onClick={action('Close button clicked')} />,
    ],
  },
}

export const LoremTwoButtons = Template.bind({})
LoremTwoButtons.args = {
  options: {
    ...LoremDefaultModalOptions,
    buttons: [
      <Modal.Button label="Cancel" key="cancel" isStyleCancel onClick={action('Close button clicked')} />,
      <Modal.Button label="Confirm" key="confirm" isStyleDefault onClick={action('Confirm button clicked')} />,
    ],
  },
}

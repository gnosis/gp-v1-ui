import React from 'react'

import * as Buttons from 'components/common/Buttons'
import { storiesOf } from '@storybook/react'
import { GlobalStyles, CenteredAndFramed, WhiteBackground } from 'storybook/decorators'

const stories = storiesOf('common/Buttons', module)
stories.addDecorator(GlobalStyles)
stories.addDecorator(CenteredAndFramed)
stories.addDecorator(WhiteBackground)
Object.keys(Buttons).forEach((name) => {
  stories.add(name, () => {
    const ButtonComponent = Buttons[name]
    return <ButtonComponent>{name}</ButtonComponent>
  })
})

import React from 'react'
import { ContentPage } from 'components/Layout/PageWrapper'
import { react as FAQ_CONTENT } from 'assets/md/FAQ.md'

const FAQ: React.FC = () => (
  <ContentPage>
    <FAQ_CONTENT />
  </ContentPage>
)

export default FAQ

import React from 'react'
import { ContentPage } from 'components/Layout/PageWrapper'
import { react as FaqContent } from 'assets/md/FAQ.md'

const FAQ: React.FC = () => (
  <ContentPage>
    <FaqContent />
  </ContentPage>
)

export default FAQ

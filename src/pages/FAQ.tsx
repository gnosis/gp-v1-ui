import React from 'react'
import { ContentPage } from 'components/layout/SwapLayout/PageWrapper'
import { react as FaqContent } from 'assets/md/FAQ.md'

const FAQ: React.FC = () => (
  <ContentPage>
    <FaqContent />
  </ContentPage>
)

export default FAQ

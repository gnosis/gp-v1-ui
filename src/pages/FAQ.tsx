import React from 'react'
import { ContentPage } from 'components/Layout/PageWrapper'
import { react as FAQ } from 'assets/md/FAQ.md'

const About: React.FC = () => (
  <ContentPage>
    <FAQ />
  </ContentPage>
)

export default About

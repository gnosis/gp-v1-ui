import React from 'react'
import { Link } from 'react-router-dom'
import PageWrapper from 'components/Layout/PageWrapper'

const NotFound: React.FC = () => (
  <PageWrapper>
    <h1>Not found</h1>
    <p>We&apos;re sorry, the page you requested could not be found</p>
    <p>
      Please go back to the&nbsp;
      <Link to="/">home page</Link>
    </p>
  </PageWrapper>
)

export default NotFound

import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { MEDIA } from 'const'

const Wrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
  background-color: var(--color-background-banner);
  text-align: center;
  font-size: 1.3rem;
  padding: 1.1rem 0;

  > p {
    line-height: 1;
    padding: 0;
    margin: 0;
    @media ${MEDIA.mobile} {
      font-size: 1.2rem;
    }
  }
`

const BannerCloser = styled.span`
  cursor: pointer;
  font-family: var(--font-arial);
  font-weight: bold;
  font-size: 1.4rem;
  margin: 0 0 0 1.2rem;
  opacity: .7;
  transition: opacity .2s ease-in-out;
    &:hover {
      opacity: 1;
    }
}
`

const DISCLAIMER = 'GP_DISCLAIMER'

const LegalBanner: React.FC = ({ children }) => {
  const [open, setOpen] = useState(localStorage.getItem(DISCLAIMER) || 'OPEN')

  useEffect(() => {
    open === 'OPEN' ? localStorage.setItem(DISCLAIMER, 'OPEN') : localStorage.setItem(DISCLAIMER, 'CLOSED')
  }, [open])

  const openCloseDisclaimer = (): void => setOpen(open === 'OPEN' ? 'CLOSED' : 'OPEN')

  return open === 'OPEN' ? (
    <Wrapper>
      {children}
      <BannerCloser onClick={openCloseDisclaimer}>✕</BannerCloser>
    </Wrapper>
  ) : null
}

export default LegalBanner

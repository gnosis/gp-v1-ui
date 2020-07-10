import styled from 'styled-components'
import { CardWidgetWrapper } from './Card'
import { MEDIA } from 'const'

export const ContentPage = styled.div`
  display: flex;
  flex-flow: row wrap;
  padding: 2.4rem 2.4rem 8rem;
  box-sizing: border-box;
  align-items: flex-start;
  align-content: flex-start;
  position: relative;
  max-width: 85rem;
  background: var(--color-background-pageWrapper);
  box-shadow: var(--box-shadow-wrapper);
  border-radius: 0.6rem;
  margin: 0 auto;
  min-height: 54rem;
  font-size: 1.4rem;
  line-height: 1.4;

  h1 {
    margin: 1rem auto 2.4rem;
    width: 100%;
    text-align: left;
    font-weight: var(--font-weight-bold);
    font-size: 2rem;
    color: var(--color-text-primary);
    letter-spacing: 0;
  }
  h2 {
    margin: 1.5rem auto 0.5rem;
    text-align: left;
    width: 100%;
    font-size: 1.8rem;
    letter-spacing: 0;
  }

  ul {
    display: block;
    margin: 0;
    width: 100%;
  }
`

export const StandaloneCardWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-flow: column wrap;
  position: relative;

  /* In use when accessed as a dedicated page and not part of OrdersPanel */
  background: var(--color-background-pageWrapper);
  box-shadow: var(--box-shadow-wrapper);
  border-radius: 0.6rem;
  min-height: 54rem;
  min-width: 85rem;
  max-width: 140rem;
  /* ====================================================================== */

  @media ${MEDIA.tablet} {
    max-width: 100%;
    min-width: 73.7rem;
  }

  @media ${MEDIA.mobile} {
    max-width: 100%;
    min-width: 100%;
    min-height: 25rem;
  }
  // Pages in standalone mode use bigger fonts
  ${CardWidgetWrapper} {
    > table {
      > thead,
      > tbody {
        font-size: 1.3rem;
      }
    }
  }
`

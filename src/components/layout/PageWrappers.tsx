import styled from 'styled-components'
import { CardWidgetWrapper } from './SwapLayout/Card'
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
  height: 100%;
  width: 100%;
  display: flex;
  flex: 1 auto;
  flex-flow: column wrap;
  position: relative;

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
export const PageWrapper = styled.section`
  height: 75rem;
  min-width: 85rem;
  max-width: 100%;

  background: var(--color-background-pageWrapper);
  border-radius: 0.6rem;
  box-shadow: var(--box-shadow-wrapper);

  @media ${MEDIA.tablet}, ${MEDIA.mobile} {
    min-height: 35rem;
    height: auto;
    // max-width: 100%;
  }

  @media ${MEDIA.tablet} {
    min-width: 72.7rem;
  }

  @media ${MEDIA.mobile} {
    min-width: 100%;
  }
`

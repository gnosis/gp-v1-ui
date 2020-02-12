import styled from 'styled-components'
import PageWrapper from 'components/Layout/PageWrapper'
import { RESPONSIVE_SIZES } from 'const'

export const PoolingInterfaceWrapper = styled(PageWrapper)`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  padding: 2.4rem;
  box-sizing: border-box;

  > h2 {
    margin: 1.6rem auto 2.4rem;
    width: 100%;
    text-align: center;
    font-weight: var(--font-weight-bold);
    font-size: 2rem;
    color: #2F3E4E;
    letter-spacing: 0;
  }

  /* @media only screen and (max-width: ${RESPONSIVE_SIZES.MOBILE_LARGE}em) {
    padding: 1.5rem;
    width: auto;
  } */
`

export const ProgressStep = styled.div<{ $bgColor?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 100%;
  font-size: xx-large;
  font-weight: bolder;

  background: ${({ $bgColor = 'var(--color-background)' }): string => $bgColor};
`

export const ProgressStepText = styled.p<{ $bold: string }>`
  font-weight: ${({ $bold }): string => $bold};
  margin: 0;
  
    > i {
      color: #476481;
      font-style: normal;
    }
`

export const GreySubText = styled.p<{ $justify?: string }>`
  display: flex;
  align-items: center;
  justify-content: ${({ $justify = 'center' }): string => $justify}

  font-size: smaller;
  font-style: italic;

  > * {
    margin: 0 0.3rem;
  }
`

export const StepSeparator = styled.div<{ $bgColor?: string }>`
  height: 1rem;
  background: ${({ $bgColor = 'lightgrey' }): string => $bgColor};
`

export const StepButtonsWrapper = styled.div`
  text-align: center;
  > button {
    min-width: 8rem;
  }
`

export const BarWrapper = styled.div<{ $bgColor?: string; $minHeight?: string }>`
  display: flex;
  flex-flow: row nowrap;
  align-items: stretch;
  justify-content: space-evenly;
  margin: 0 auto;
  min-height: ${({ $minHeight = '5vw' }): string => $minHeight};
  min-width: 35vw;

  > * {
    display: flex;
    text-align: center;

    &:nth-child(odd) {
      flex: 1;
    }
    &:nth-child(even) {
      flex: 2;
    }
  }

  > p,
  ${StepSeparator} {
    margin: 0 -0.1rem;
    white-space: nowrap;
  }

  > ${ProgressStep}, ${StepSeparator}, ${ProgressStepText}, ${StepButtonsWrapper} {
    transition: all 0.7s ease-in-out;
  }

  @media only screen and (max-width: ${RESPONSIVE_SIZES.WEB}em) {
    min-height: 7.143vw;
    min-width: 50vw;

    > p {
      white-space: normal;
    }

    > div {
      > p {
        font-size: smaller;
      }
    }
  }

  @media only screen and (max-width: ${RESPONSIVE_SIZES.MOBILE_LARGE}em) {
    min-height: 10.8vw;
    min-width: 75vw;
    > p {
      font-size: smaller;
    }
  }

  @media only screen and (max-width: ${RESPONSIVE_SIZES.MOBILE_SMALL}em) {
    margin: 0;
    width: 90%;
  }
`

export const StepDescriptionWrapper = styled.div`
  width: 50%;
  padding: 0 1.5rem 0 0;
  box-sizing: border-box;

  > ul {
    list-style: none;
    padding-inline-start: 2rem;

    > li {
      > svg {
        color: green;
      }

      > * {
        margin-right: 0.5rem;
      }
    }
  }
`

export const HighlightDiv = styled.div<{ $bgColor?: string }>`
  background: ${({ $bgColor = 'var(--color-background-highlighted)' }): string => $bgColor};
  display: inline-flex;
  transition: all 0.5s ease-in-out;
`

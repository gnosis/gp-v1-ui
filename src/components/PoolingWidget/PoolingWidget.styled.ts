import styled from 'styled-components'
import PageWrapper from 'components/Layout/PageWrapper'
import { RESPONSIVE_SIZES } from 'const'

export const PoolingInterfaceWrapper = styled(PageWrapper)`
  display: flex;
  flex-flow: column nowrap;

  align-items: center;

  > h2:first-child {
    margin-right: auto;
  }
`

export const ProgressStep = styled.div<{ $bgColor?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 100%;
  font-size: xx-large;
  font-weight: bolder;

  background: ${({ $bgColor = 'lightgrey' }): string => $bgColor};
`

export const ProgressStepText = styled.p<{ $bold: string }>`
  font-weight: ${({ $bold }): string => $bold};
  margin: 0;
`

export const StepSeparator = styled.div<{ $bgColor?: string }>`
  align-self: center;
  height: 1rem;

  background: ${({ $bgColor = 'lightgrey' }): string => $bgColor};
`

export const BarWrapper = styled.div<{ $bgColor?: string; $minHeight?: string }>`
  display: flex;
  flex-flow: row nowrap;
  align-items: stretch;
  justify-content: space-evenly;

  margin: 0.7rem auto;
  min-height: ${({ $minHeight = '5vw' }): string => $minHeight};
  min-width: 35vw;

  > * {
    display: flex;
    flex: 1;

    text-align: center;
  }

  > p,
  ${StepSeparator} {
    margin: 0 -0.1rem;
    white-space: nowrap;
  }

  > ${ProgressStep}, ${StepSeparator}, ${ProgressStepText} {
    transition: all 0.7s ease-in-out;
  }

  @media only screen and (max-width: ${RESPONSIVE_SIZES.WEB}em) {
    min-height: 7.143vw;
    min-width: 50vw;

    > p {
      white-space: normal;
    }
  }
`

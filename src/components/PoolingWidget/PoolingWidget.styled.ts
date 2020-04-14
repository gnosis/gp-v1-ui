import styled from 'styled-components'
import { PageWrapper } from 'components/Layout/PageWrapper'
import arrowBlue from 'assets/img/arrow-blue.svg'
import arrowWhite from 'assets/img/arrow-white.svg'
import { MEDIA } from 'const'

export const PoolingInterfaceWrapper = styled(PageWrapper)`
  display: flex;
  flex-flow: row wrap;
  padding: 2.4rem 2.4rem 8rem;
  box-sizing: border-box;
  align-items: flex-start;
  align-content: flex-start;
  position: relative;
  max-width: 85rem;
  background: var(--color-background-pageWrapper);
  box-shadow: 0 -1rem 4rem 0 rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.02) 0 0.276726rem 0.221381rem 0,
    rgba(0, 0, 0, 0.027) 0 0.666501rem 0.532008rem 0, rgba(0, 0, 0, 0.035) 0 1.25216rem 1.0172rem 0,
    rgba(0, 0, 0, 0.043) 0 2.23363rem 1.7869rem 0, rgba(0, 0, 0, 0.05) 0 4.17776rem 3.34221rem 0,
    rgba(0, 0, 0, 0.07) 0 10rem 8rem 0;
  border-radius: 0.6rem;
  margin: 0 auto;
  min-height: 54rem;
  font-size: 1.4rem;
  line-height: 1.4;

  @media ${MEDIA.mobile} {
    flex-flow: column wrap;
    padding: 1.6rem 1.6rem 0;
    width: 100%;
    font-size: 1.3rem;
  }

  form > h2 {
    margin: 1rem auto 2.4rem;
    width: 100%;
    text-align: center;
    font-weight: var(--font-weight-bold);
    font-size: 2rem;
    color: var(--color-text-primary);
    letter-spacing: 0;
  }
`

export const ProgressStep = styled.div<{ $bgColor?: string }>`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: center;

  > p {
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    justify-content: center;
    height: 2.5rem;
    width: 2.5rem;
    border-radius: 2.5rem;
    color: var(--color-background-pageWrapper);
    font-weight: var(--font-weight-normal);
    font-size: inherit;
    letter-spacing: 0;
    text-align: center;
    background: ${({ $bgColor = 'var(--color-background)' }): string => $bgColor};
    margin: 0 0.5rem 0 0;
  }

  &[data-title]::after {
    display: inline-block;
    content: attr(data-title);
    font-weight: var(--font-weight-normal);
    font-size: inherit;
    color: var(--color-text-primary);
    letter-spacing: 0;

    @media ${MEDIA.mobile} {
      font-size: 1.2rem;
      margin: 1rem 0 0;
    }
  }

  &.active {
    > p,
    &[data-title]::after {
      font-weight: var(--font-weight-bold);
    }
  }
`

export const ProgressStepText = styled.p`
  font-weight: var(--font-weight-bold);
  margin: 0;
  color: var(--color-text-primary);
  font-size: inherit;
  line-height: inherit;

  > i {
    color: var(--color-text-primary);
    font-style: normal;
    font-weight: var(--font-weight-normal);
    font-size: inherit;
  }
`

export const GreySubText = styled.p<{ $justify?: string }>`
  display: flex;
  align-items: flex-start;
  justify-content: ${({ $justify = 'flex-start' }): string => $justify};
`

export const StepSeparator = styled.div<{ $bgColor?: string }>`
  height: 0.1rem;
  width: 13rem;
  margin: 0 1rem;
  background: var(--color-background-banner);
`

export const StepButtonsWrapper = styled.div`
  display: flex;
  width: 100%;
  margin: auto 0 0;
  height: 5.6rem;
  position: absolute;
  bottom: 0;
  left: 0;
  border-top: 0.1rem solid var(--color-background-banner);
  justify-content: space-between;
  align-items: center;

  @media ${MEDIA.mobile} {
    position: relative;
    height: auto;
  }

  > button,
  > a {
    margin: 0 1.6rem;
    border-radius: 0.6rem;
    outline: 0;
    height: 3.6rem;
    box-sizing: border-box;
    letter-spacing: 0.03rem;
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
  }

  > button#backButton {
    font-weight: var(--font-weight-bold);
    text-transform: uppercase;
    background: transparent;
    font-size: 1.4rem;
    color: var(--color-text-active);
    letter-spacing: 0;
    line-height: 1;
    transition: color 0.2s ease-in-out;

    @media ${MEDIA.mobile} {
      margin: 1.6rem 1.6rem 1.6rem 0;
      font-size: 1.3rem;
      padding: 0 1rem 0 0;
    }

    &:hover {
      background: 0;
      color: var(--color-background-button-hover);
    }

    &::before {
      content: '';
      background: url(${arrowBlue}) no-repeat center/contain;
      width: 0.7rem;
      height: 1.2rem;
      display: inline-block;
      margin: 0 0.8rem 0 0;
    }
  }

  > button:last-of-type:not(#backButton),
  > a.finish {
    border-radius: 0.6rem;
    min-width: 14rem;
    padding: 0 1.6rem;
    font-weight: var(--font-weight-bold);
    text-transform: uppercase;
    font-size: 1.4rem;
    margin: 0 1.6rem 0 auto;

    @media ${MEDIA.mobile} {
      margin: 1.6rem 0 1.6rem 1.6rem;
      font-size: 1.3rem;
      padding: 0 1rem;
    }

    > svg {
      margin: 0 0.8rem 0 0;
    }

    &:disabled,
    &[disabled] {
      cursor: not-allowed;
      pointer-events: initial;
    }

    &::after {
      content: '';
      background: url(${arrowWhite}) no-repeat center/contain;
      width: 0.7rem;
      height: 1.2rem;
      display: inline-block;
      margin: 0 0 0 0.8rem;
    }
  }
`

export const BarWrapper = styled.div<{ $bgColor?: string; $minHeight?: string }>`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
  margin: 1rem auto 4rem;
  width: 100%;
  white-space: nowrap;

  @media ${MEDIA.mobile} {
    margin: 0 auto 3rem;
  }

  > ${ProgressStep}, ${StepSeparator}, ${ProgressStepText}, ${StepButtonsWrapper} {
    transition: background 0.7s ease-in-out;
  }

  > ${ProgressStepText} {
    @media ${MEDIA.mobile} {
      margin: 0;
    }
  }

  > ${StepButtonsWrapper} {
    @media ${MEDIA.mobile} {
      position: relative;
      height: auto;
    }
  }

  > ${StepSeparator} {
    @media ${MEDIA.mobile} {
      margin: 0 0 2.1rem;
    }
  }
`

export const StepDescriptionWrapper = styled.div`
  width: 50%;
  padding: 0 2.4rem 0 0;
  box-sizing: border-box;

  @media ${MEDIA.mobile} {
    width: 100%;
    padding: 0;
  }

  .liqContent {
    color: var(--color-text-primary);
    font-size: inherit;
    line-height: inherit;
    margin: 1.6rem 0 0;

    > ul {
      list-style: none;
      padding-inline-start: 2rem;
      padding: 0;
    }

    > ul > li {
      margin: 0 0 0.5rem;
    }

    > ul > li > img {
      margin: 0 0.5rem 0 0;
    }
  }
`

export const HighlightDiv = styled.div<{ $bgColor?: string }>`
  background: ${({ $bgColor = 'var(--color-background-highlighted)' }): string => $bgColor};
  display: inline-flex;
  transition: all 0.5s ease-in-out;
`

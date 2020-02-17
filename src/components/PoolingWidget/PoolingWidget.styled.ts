import styled from 'styled-components'
import PageWrapper from 'components/Layout/PageWrapper'
import arrowBlue from 'assets/img/arrow-blue.svg'
import arrowWhite from 'assets/img/arrow-white.svg'

export const PoolingInterfaceWrapper = styled(PageWrapper)`
  display: flex;
  flex-flow: row wrap;
  padding: 2.4rem 2.4rem 8rem;
  box-sizing: border-box;
  align-items: flex-start;
  align-content: flex-start;
  position: relative;

  > h2 {
    margin: 1rem auto 2.4rem;
    width: 100%;
    text-align: center;
    font-weight: var(--font-weight-medium);
    font-size: 2rem;
    color: #2f3e4e;
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
    color: #ffffff;
    font-weight: var(--font-weight-normal);
    font-size: 1.4rem;
    letter-spacing: 0;
    text-align: center;
    background: ${({ $bgColor = 'var(--color-background)' }): string => $bgColor};
    margin: 0 0.5rem 0 0;
  }

  &[data-title]::after {
    display: inline-block;
    content: attr(data-title);
    font-weight: var(--font-weight-normal);
    font-size: 1.4rem;
    color: #2f3e4e;
    letter-spacing: 0;
  }

  &.active {
    > p,
    &[data-title]::after {
      font-weight: var(--font-weight-medium);
    }
  }
`

export const ProgressStepText = styled.p`
  font-weight: var(--font-weight-medium);
  margin: 0;
  color: #2f3e4e;
  font-size: 1.6rem;

  > i {
    color: #476481;
    font-style: normal;
  }
`

export const GreySubText = styled.p<{ $justify?: string }>`
  display: flex;
  align-items: flex-start;
  justify-content: ${({ $justify = 'flex-start' }): string => $justify};
`

export const StepSeparator = styled.div<{ $bgColor?: string }>`
  height: .1rem;
  width: 13rem;
  margin: 0 1rem;
  background: #DFE6EF;
  /* background: ${({ $bgColor = 'lightgrey' }): string => $bgColor}; */
`

export const StepButtonsWrapper = styled.div`
  display: flex;
  width: 100%;
  margin: auto 0 0;
  height: 5.6rem;
  position: absolute;
  bottom: 0;
  left: 0;
  border-top: 0.1rem solid #dfe6ef;
  justify-content: space-between;
  align-items: center;

  > button {
    margin: 0 1.6rem;
    border-radius: 0.6rem;
    outline: 0;
    height: 3.6rem;
    box-sizing: border-box;
    letter-spacing: 0.03rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  > button:first-of-type {
    font-weight: var(--font-weight-medium);
    text-transform: uppercase;
    font-size: 1.4rem;
    color: #218dff;
    letter-spacing: 0;
    line-height: 1;
    transition: color 0.2s ease-in-out;

    &:hover {
      background: 0;
      color: #0b66c6;
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

  > button:last-of-type {
    background: #218dff;
    border-radius: 0.6rem;
    min-width: 14rem;
    padding: 0 1.6rem;
    font-weight: var(--font-weight-medium);
    color: #ffffff;
    text-transform: uppercase;
    font-size: 1.4rem;

    > svg {
      margin: 0 0.8rem 0 0;
    }

    &:hover {
      background: #0b66c6;
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

  > ${ProgressStep}, ${StepSeparator}, ${ProgressStepText}, ${StepButtonsWrapper} {
    transition: background 0.7s ease-in-out;
  }
`

export const StepDescriptionWrapper = styled.div`
  width: 50%;
  padding: 0 2.4rem 0 0;
  box-sizing: border-box;

  .liqContent {
    color: #456483;
    font-size: 1.4rem;
    line-height: 1.4;
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

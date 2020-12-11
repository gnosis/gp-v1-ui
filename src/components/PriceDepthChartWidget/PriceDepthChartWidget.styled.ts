import styled from 'styled-components'
// import ArrowWhite from 'assets/img/arrow-white.svg'

export const PriceDepthChartWidgetStyled = styled.div`
  height: 100%;
  display: flex;
  width: 100%;
  background: var(--color-primary);
  grid-area: priceDepthChartWidget;
  align-self: start;
  flex-flow: row wrap;

  /* ONLY to override the original Mesa V1 component. */
  > div:first-of-type {
    min-height: initial;
    height: 100%;
  }
`

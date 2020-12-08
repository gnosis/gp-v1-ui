import styled from 'styled-components'

export const TradingStyled = styled.div`
  overflow: hidden;
  flex: 1 1 auto;
  width: 100%;
  height: calc(100vh - 8.6rem);
  display: grid;
  grid-template-areas: 'orderform marketnavbar marketnavbar' 'orderform orderbook priceDepthChartWidget';
  grid-template-columns:
    [orderform] minmax(15rem, 31rem)
    [orderbook] minmax(15rem, 31rem)
    [marketnavbar] auto
    [priceDepthChartWidget] fit-content(100%);
  grid-template-rows: [marketnavbar] minmax(var(--height-bar-default), var(--height-bar-default));
  align-items: start;
`

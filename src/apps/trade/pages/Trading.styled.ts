import styled from 'styled-components'
import { MEDIA } from 'const'

export const TradingStyled = styled.div`
  flex: 1 1 auto;
  width: 100%;
  height: calc(100vh - 7.8rem);
  display: grid;
  position: fixed;
  grid-template-areas:
    'orderform marketnavbar marketnavbar marketnavbar'
    'orderform orderbook priceDepthChartWidget priceDepthChartWidget'
    'orderform orderbook orders orders';
  grid-template-columns:
    [orderform] minmax(15rem, 28rem)
    [orderbook] minmax(15rem, 28rem)
    [marketnavbar] auto
    [priceDepthChartWidget] fit-content(100%)
    [orders] fit-content(100%);
  grid-template-rows: var(--height-bar-default) 65% 35%;
  align-items: start;

  @media ${MEDIA.tablet} {
    grid-template-areas:
      'orderform marketnavbar marketnavbar marketnavbar'
      'orderform priceDepthChartWidget priceDepthChartWidget priceDepthChartWidget'
      'orderform orderbook orderbook orderbook'
      'orderform orders orders orders';
    grid-template-rows: var(--height-bar-default) 33% 33% 34%;
  }

  @media ${MEDIA.mobile} {
    grid-template-areas:
      'orderform marketnavbar marketnavbar marketnavbar'
      'orderform priceDepthChartWidget priceDepthChartWidget priceDepthChartWidget'
      'orderform orderbook orderbook orderbook'
      'orderform orders orders orders';
    grid-template-columns:
      [orderform] minmax(15rem, 100%)
      [orderbook] minmax(15rem, 100%)
      [marketnavbar] fit-content(100%)
      [priceDepthChartWidget] fit-content(100%)
      [orders] fit-content(100%);
    grid-template-rows:
      [marketnavbar] minmax(var(--height-bar-default), var(--height-bar-default))
      [orderbook] 5rem;
  }
`

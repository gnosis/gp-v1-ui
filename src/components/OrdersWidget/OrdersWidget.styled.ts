import styled from 'styled-components'
import { MEDIA } from 'const'

export const OrdersWrapper = styled.div<{
  $isWidget?: boolean
  $mobileHeight?: string
  $tabletHeight?: string
  $webHeight?: string
}>`
  height: ${({ $webHeight = 'auto' }): string | undefined => $webHeight};

  @media ${MEDIA.mobile} {
    height: ${({ $mobileHeight = 'auto' }): string | undefined => $mobileHeight};
  }

  @media ${MEDIA.tablet} {
    height: ${({ $tabletHeight = 'auto' }): string | undefined => $tabletHeight};
  }

  transition: height 0.2s ease-in;

  width: 100%;
  display: flex;
  flex-flow: column wrap;
  position: relative;

  
  ${({ $isWidget }): string =>
    $isWidget
      ? `
    // Orders component as Widget (e.g inside the OrdersPanel)
    background: transparent;
    box-shadow: none;
    border-radius: 0;
    min-width: initial;
    max-width: initial;`
      : `
    // As a standalone page
    background: var(--color-background-pageWrapper);
    box-shadow: 0 -1rem 4rem 0 rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.02) 0 0.276726rem 0.221381rem 0,
      rgba(0, 0, 0, 0.027) 0 0.666501rem 0.532008rem 0, rgba(0, 0, 0, 0.035) 0 1.25216rem 1.0172rem 0,
      rgba(0, 0, 0, 0.043) 0 2.23363rem 1.7869rem 0, rgba(0, 0, 0, 0.05) 0 4.17776rem 3.34221rem 0,
      rgba(0, 0, 0, 0.07) 0 10rem 8rem 0;
    border-radius: 0.6rem;
    min-width: 85rem;
    max-width: 140rem;
    `}

  @media ${MEDIA.mobile} {
    max-width: 100%;
    min-width: initial;
    width: 100%;
  }

  > div {
    width: 100%;
    position: relative;
    display: flex;
    flex-flow: column nowrap;
    flex: 1 1 auto;
    min-width: initial;
  }

  > a {
    margin-bottom: -2em;
  }

  .noOrdersInfo {
    text-align: center;
    line-height: 1.4;
  }
`

export const ButtonWithIcon = styled.button<{ $color?: string }>`
  padding: 0.5rem 1rem;
  border-radius: 6rem;
  border: 0.1rem solid;
  transition: background 0.2s ease-in-out, color 0.2s ease-in-out;
  background: transparent;
  color: ${({ $color = 'var(--color-text-deleteOrders)' }): string => $color};
  outline: 0;

  &:hover {
    background: ${({ $color = 'var(--color-text-deleteOrders)' }): string => $color};
    color: var(--color-background-pageWrapper);
  }

  > svg {
    margin: 0 0.25rem;
  }
`

export const OrderWidgetDataWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  min-height: 5%;
`

export const OrdersWidgetInnerWrapper = styled.div`
  height: 100%;

  .infoContainer {
    margin: 0 auto;
    display: flex;
    flex-flow: row nowrap;
    width: 100%;
    justify-content: center;
    height: 6.4rem;
    align-items: center;

    @media ${MEDIA.mobile} {
      margin: 0 auto;
    }

    .countContainer {
      display: flex;
      width: 100%;
      height: 100%;
      margin: 0 0 -0.1rem;
      align-items: center;

      > button {
        font-weight: var(--font-weight-bold);
        font-size: 1.5rem;
        color: var(--color-text-secondary);
        letter-spacing: 0;
        text-align: center;
        background: transparent;
        flex: 1;
        height: 100%;
        outline: 0;
        text-transform: uppercase;
        display: flex;
        width: 100%;
        justify-content: center;
        transition: border 0.2s ease-in-out;
        align-items: center;
        border-bottom: 0.3rem solid transparent;
        // min-height: 6.4rem;

        @media ${MEDIA.mobile} {
          font-size: 1.3rem;
        }
      }

      > button > i {
        height: 1.8rem;
        font-weight: inherit;
        font-size: 1.1rem;
        color: var(--color-background-pageWrapper);
        letter-spacing: -0.046rem;
        text-align: center;
        background: var(--color-text-secondary);
        border-radius: 6rem;
        padding: 0 0.75rem;
        box-sizing: border-box;
        line-height: 1.8rem;
        font-style: normal;
        display: inline-block;
        height: 1.8rem;
        margin: 0 0 0 0.5rem;
      }

      > button.selected {
        border-bottom: 0.3rem solid var(--color-text-active);
        color: var(--color-text-active);
      }

      > button.selected > i {
        background: var(--color-text-active);
      }
    }
  }

  .ordersContainer {
    display: grid;
    padding: 0 0 5rem;
    box-sizing: border-box;
    overflow-y: auto;
  }

  .checked {
    display: flex;
    justify-content: left;
    align-items: center;
  }

  .deleteContainer {
    display: flex;
    flex-direction: column;
    position: sticky;
    top: 4rem;
    z-index: 2;
    justify-content: flex-start;
    align-items: center;
    background: var(--color-background-deleteOrders);
    color: var(--color-text-deleteOrders);
    text-align: left;
    padding: 0.8rem 1.1rem;
    opacity: 1;
    font-size: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.05rem;
    transition: height 0.2s ease-in-out, opacity 0.2s ease-in-out;
    outline: 0;
    flex-flow: row nowrap;

    &[data-disabled='true'] {
      height: 0;
      overflow: hidden;
      padding: 0 0.9rem;
      opacity: 0;
    }

    > b {
      margin: 0 1rem 0 0;
      font-weight: var(--font-weight-bold);
      font-family: initial;
    }
  }

  .noOrders {
    padding: 3em;
    display: flex;
    justify-content: center;

    @media ${MEDIA.mobile} {
      font-size: 1.4rem;
      min-height: 20rem;
    }
  }

  .warning {
    color: orange;
  }
`

import styled from 'styled-components'
import { FoldableRowWrapper } from 'components/layout/LegacyTradeLayout/Card'
import { MEDIA } from 'const'

export const OrderRowWrapper = styled(FoldableRowWrapper)<{ $color?: string }>`
  color: ${({ $color = '' }): string => $color};

  div.surplusHighlight {
    color: var(--color-button-success);
    font-size: smaller;
    font-weight: bolder;
    margin: 0.2rem 0;
  }

  &.pending {
    background: rgba(33, 141, 255, 0.1);
  }

  &.scheduled {
    background: rgba(0, 201, 167, 0.08);
  }

  .order-image-row {
    display: none;
  }

  .order-details-responsive {
    display: none;
  }

  .order-details {
    white-space: normal;
    word-break: break-word;
  }

  .sub-columns {
    display: flex;
    flex-flow: row wrap;
    justify-content: flex-start;
    align-items: center;

    > div:not(:last-child) {
      margin: 0 0.3rem 0 0;
    }
  }

  .pendingCell {
    justify-content: center;
    align-items: center;
    display: flex;

    a {
      top: 100%;
      position: absolute;
    }
  }

  td {
    &.column {
      > div {
        width: 100%;
      }
    }
    &[data-label='Order ID'],
    &[data-label='Market'] {
      cursor: pointer;
    }
  }

  @media ${MEDIA.mobile} {
    &&&&& {
      td[data-label='Market'] {
        border-bottom: 0.1rem solid rgba(0, 0, 0, 0.14);
      }

      td[data-label='Status'] {
        border: none;
      }
    }
  }
`

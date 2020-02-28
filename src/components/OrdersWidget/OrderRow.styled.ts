import styled from 'styled-components'

export const OrderRowWrapper = styled.tr<{ $color?: string; $open?: boolean }>`
  color: ${({ $color = '' }): string => $color};
  min-height: 4rem;

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
    word-break: break-all;

    .order-details-subgrid {
    }
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
`

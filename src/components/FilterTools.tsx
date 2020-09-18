import React from 'react'
import styled from 'styled-components'
// Components
import { FormMessage } from 'components/common/FormMessage'
// Assets
import searchIcon from 'assets/img/search.svg'
// Misc
import { MEDIA } from 'const'

export const BalanceTools = styled.div<{ $css?: string | false }>`
  display: flex;
  width: 100%;
  justify-content: space-between;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  align-items: center;
  order: 0;

  .focusAnimation {
    animation-duration: 0.5s;
    animation-name: focusAnimation;
  }

  @keyframes focusAnimation {
    from {
      background-color: var(--color-background-input);
      color: var(--color-text-primary);
      border-color: var(--color-button-primary);
    }

    50% {
      background-color: var(--color-background-balance-button-hover);
      color: var(--color-background-pageWrapper);
      border-color: var(--color-button-primary);
    }

    to {
      background-color: var(--color-background-input);
      color: var(--color-text-primary);
      border-color: var(--color-button-primary);
    }
  }

  ${FormMessage} {
    color: var(--color-text-primary);
    background: var(--color-background-validation-warning);
    font-size: x-small;
    margin: 0;
    position: absolute;
    bottom: 0;
    left: 0;
    width: max-content;
    padding: 0.1rem 1.6rem 0.1rem 0.5rem;
    border-radius: 0 1.6rem 0rem 0rem;
  }

  // label + search input
  > .balances-searchTokens {
    position: relative;
    display: flex;
    width: 100%;
    height: 4rem;
    margin: 1.2rem;

    @media ${MEDIA.mobile} {
      height: 4.6rem;
      margin: 0 0 1.6rem 0;

      > input {
        flex: 1 1 50%;
      }

      > ${FormMessage} {
        bottom: -1.2rem;
        border-radius: 0 0 1.6rem 0rem;
      }
    }

    > .filterClear {
      position: absolute;
      top: 32%;
      right: 2rem;
      cursor: pointer;
      font-size: small;
      text-decoration: underline;
    }

    > input {
      margin: 0;
      max-width: 100%;
      background: var(--color-background-input) url(${searchIcon}) no-repeat left 1.6rem center/1.6rem;
      border-radius: 0.6rem 0.6rem 0 0;
      border: 0;
      font-size: 1.4rem;
      line-height: 1;
      box-sizing: border-box;
      border-bottom: 0.2rem solid transparent;
      font-weight: var(--font-weight-normal);
      // accommodate clearFilter
      padding: 0 10.4rem 0 4.8rem;
      outline: 0;

      @media ${MEDIA.mobile} {
        font-size: 1.3rem;
      }

      &::placeholder {
        font-size: inherit;
        color: inherit;
      }

      &:focus {
        color: var(--color-text-active);
      }

      &:focus {
        border-bottom: 0.2rem solid var(--color-text-active);
        border-color: var(--color-text-active);

        transition: all 0.2s ease-in-out;
      }

      &.error {
        border-color: var(--color-error);
      }

      &.warning {
        border-color: orange;
      }

      &:disabled {
        box-shadow: none;
      }
    }
  }
  ${({ $css = '' }): string | false => $css}
`

interface Props {
  customStyles?: string | false
  className?: string
  dataLength: number
  resultName?: string
  searchValue: string
  showFilter: boolean
  customRef?: React.Ref<HTMLInputElement>
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void
  clearFilters?: () => void
}

const FilterTools: React.FC<Props> = ({
  children,
  className,
  customStyles,
  dataLength,
  resultName = 'results',
  searchValue,
  showFilter,
  customRef,
  handleSearch,
  clearFilters,
}) => {
  return (
    <BalanceTools className={className} $css={customStyles}>
      <label className="balances-searchTokens">
        <input
          ref={customRef}
          placeholder="Search data by Order ID or token by Name, Symbol or Address"
          type="text"
          value={searchValue}
          onChange={handleSearch}
        />
        {!!clearFilters && !!searchValue && (
          <span className="filterClear" onClick={clearFilters}>
            clear filters
          </span>
        )}
        {showFilter && (
          <FormMessage id="filterLabel">
            Filter: Showing {dataLength} {dataLength === 1 ? 'result' : resultName}
          </FormMessage>
        )}
      </label>
      <>{children}</>
    </BalanceTools>
  )
}

export default FilterTools

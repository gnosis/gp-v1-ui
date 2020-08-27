import React from 'react'
import styled from 'styled-components'
// Components
import FormMessage from './TradeWidget/FormMessage'
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

  ${FormMessage} {
    color: var(--color-text-primary);
    background: var(--color-background-validation-warning);
    /* font-size: x-small; */
    font-size: small;
    margin: 0;
    /* position: absolute;
    bottom: 0;
    left: 0; */
    width: max-content;
    /* padding: 0.1rem 1.6rem 0.1rem 0.5rem; */
    padding: 1.3rem 1.6rem;
    box-sizing: border-box;
    /* border-radius: 0 1.6rem 0rem 0rem; */
    border-radius: 0;
  }

  // label + search input
  > .balances-searchTokens {
    position: relative;
    display: flex;
    width: 100%;
    height: 100%;
    /* margin: 1.2rem; */
    margin: 0;

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

    > input {
      margin: 0;
      max-width: 100%;
      background: url(${searchIcon}) no-repeat left 1.6rem center/1.6rem;
      border-radius: 0.6rem 0.6rem 0 0;
      border: 0;
      font-size: 1.4rem;
      min-height: 5.2rem;
      line-height: 1;
      box-sizing: border-box;
      border-bottom: 0.2rem solid transparent;
      font-weight: var(--font-weight-normal);
      padding: 0 1.6rem 0 4.8rem;
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
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const FilterTools: React.FC<Props> = ({
  children,
  className,
  customStyles,
  dataLength,
  resultName = 'results',
  searchValue,
  showFilter,
  handleSearch,
}) => (
    <BalanceTools className={className} $css={customStyles}>
      <label className="balances-searchTokens">
        <input
          placeholder="Search token by Name, Symbol or Address"
          type="text"
          value={searchValue}
          onChange={handleSearch}
        />
        {showFilter && (
          <FormMessage id="filterLabel">
            Filter: Showing {dataLength} {dataLength === 1 ? 'result' : resultName}
          </FormMessage>
        )}
      </label>
      <>{children}</>
    </BalanceTools>
  )

export default FilterTools

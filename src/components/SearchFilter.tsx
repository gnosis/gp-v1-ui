import React, { useCallback } from 'react'
import { unstable_batchedUpdates as batchUpdate } from 'react-dom'
import styled from 'styled-components'
import useSafeState from 'hooks/useSafeState'

const SearchFilterInput = styled.input<{
  $background?: string
  $fontColor?: string
  $fontSize?: string
  $margin?: string
  $padding?: string
  $width?: string
}>`
  background: ${({ $background = 'initial' }): string => $background};
  color: ${({ $fontColor = 'initial' }): string => $fontColor};
  width: ${({ $width = '5rem' }): string => $width};
  margin: ${({ $margin = '0' }): string => $margin};
  padding: ${({ $padding = '0' }): string => $padding};
  height: 100%;
  border: none;
  font-size: ${({ $fontSize = 'large' }): string => $fontSize};
  text-align: center;

  transition: width 0.2s ease-in-out;
`

interface SearchFilterProps {
  openWidth?: string
  closedWidth?: string
  focusBgColor?: string
  blurBgColor?: string
  focusFontColor?: string
  blurFontColor?: string
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  openWidth = '20rem',
  closedWidth = '5rem',
  focusBgColor = 'initial',
  blurBgColor = 'initial',
  focusFontColor = 'initial',
  blurFontColor = 'initial',
}) => {
  const [focus, setFocus] = useSafeState(false)
  const [filter, setFilter] = useSafeState('')

  const handleBlur = useCallback((): void => {
    batchUpdate(() => {
      setFocus(false)
      setFilter('')
    })
  }, [setFocus, setFilter])

  const handleOnChange = useCallback(e => setFilter(e.target.value), [setFilter])

  return (
    <SearchFilterInput
      type="text"
      placeholder="🔍"
      value={filter}
      onChange={handleOnChange}
      onFocus={(): void => setFocus(true)}
      onBlur={handleBlur}
      $background={focus ? focusBgColor : blurBgColor}
      $fontColor={focus ? focusFontColor : blurFontColor}
      $width={focus ? openWidth : closedWidth}
    />
  )
}

export default SearchFilter

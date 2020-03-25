import React, { ComponentType, useRef, useEffect, useCallback } from 'react'
import { components, MenuListComponentProps } from 'react-select'

// Inspired by https://github.com/JedWatson/react-select/issues/3111#issuecomment-470911304

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MenuList: ComponentType<MenuListComponentProps<any>> = props => {
  const {
    selectProps: { onKeyDown, onInputChange, onMenuInputFocus, inputValue, value },
    setValue,
  } = props

  const childrenRef = useRef(props.children)
  childrenRef.current = props.children

  const selectCurrent = useCallback((): void => setValue(value, 'set-value'), [setValue, value])

  // Wrap the event to capture `Enter` and avoid losing focus when there's no value set in the menu
  const wrappedOnKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (
        e.key === 'Enter' &&
        React.Children.count(childrenRef.current) === 1 &&
        React.isValidElement(childrenRef.current) &&
        childrenRef.current.props.children === 'No results'
      ) {
        // the only child is noOptionsMessage, which returns string 'No results'
        e.preventDefault()
      }

      // When hitting the Esc key, the select will close.
      // If nothing is selected, the select will contain an empty value. Which we don't like.
      // To prevent that, we set again the currently selected value.
      else if (e.key === 'Escape') {
        selectCurrent()
      }

      onKeyDown?.(e)
    },
    [onKeyDown, selectCurrent],
  )

  const ariaAttributes = {
    'aria-label': props.selectProps['aria-label'],
    'aria-labelledby': props.selectProps['aria-labelledby'],
  }

  // On input's change event, we call the select's `onInputChange` handler with the appropriated action
  const onChange = useCallback(
    (e): void => {
      onInputChange?.(e.currentTarget.value, {
        action: 'input-change',
      })
    },
    [onInputChange],
  )

  // To avoid triggering side effects on upper layers that causes the menu to be closed,
  // we stopPropagation and trigger a focus
  const onInputClick = useCallback((e): void => {
    e.stopPropagation()
    e.currentTarget.focus()
  }, [])

  // for autofocus
  const inputRef = useRef<HTMLInputElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <>
      <div className="menulist-head">
        <div className="header">
          <h2>Select token</h2>
          <button type="button" onClick={selectCurrent}>
            ×
          </button>
        </div>
        <div className="searchContainer" ref={searchContainerRef}>
          <input
            ref={inputRef}
            autoCorrect="off"
            autoComplete="off"
            spellCheck="false"
            type="text"
            placeholder="Search by token Name, Symbol or Address"
            value={inputValue}
            onChange={onChange}
            onKeyDown={wrappedOnKeyDown}
            onMouseDown={onInputClick}
            onTouchEnd={onInputClick}
            onFocus={onMenuInputFocus}
            {...ariaAttributes}
          />
        </div>
      </div>
      <components.MenuList {...props} />
    </>
  )
}

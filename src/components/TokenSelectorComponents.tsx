import React, { ComponentType, useRef, useEffect, useCallback } from 'react'
import { components, MenuListComponentProps } from 'react-select'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'

// Inspired by https://github.com/JedWatson/react-select/issues/3111#issuecomment-470911304

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MenuList: ComponentType<MenuListComponentProps<any>> = props => {
  const {
    selectProps: { onKeyDown, onInputChange, onMenuInputFocus, inputValue, value },
    setValue,
  } = props

  const childrenRef = useRef(props.children)
  childrenRef.current = props.children

  // Wrap the event to capture `Enter` and avoid losing focus when there's no value set in the menu
  const wrappedOnKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const childrenNames = React.Children.map(
        childrenRef.current,
        (c: { type: { name: string } }): string => c.type.name,
      )

      if (childrenNames?.length === 1 && e.key === 'Enter' && childrenNames[0] === 'NoOptionsMessage') {
        // the only child is noOptionsMessage
        e.preventDefault()
      }

      onKeyDown?.(e)
    },
    [onKeyDown],
  )

  const ariaAttributes = {
    'aria-label': props.selectProps['aria-label'],
    'aria-labelledby': props.selectProps['aria-labelledby'],
  }

  // Since I couldn't for the life of me figure out a way to call some sort of close on the menu,
  // David offered the idea to instead set a value on the select.
  // When a value is selected, the menu is closed. The value is whatever was selected already.
  const onCloseButtonClick = useCallback((): void => setValue(value, 'set-value'), [setValue, value])

  // On input's change event, we call the select's `onInputChange` handler with the appropriated action
  const onChange = useCallback(
    (e): void => {
      onInputChange &&
        onInputChange(e.currentTarget.value, {
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
  useEffect(() => inputRef.current?.focus(), [])

  return (
    <>
      <div className="header">
        <h2>Select token</h2>
        <button type="button" onClick={onCloseButtonClick}>
          X
        </button>
      </div>
      <div className="searchContainer">
        <FontAwesomeIcon icon={faSearch} />
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
      <components.MenuList {...props} />
    </>
  )
}

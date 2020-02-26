import React, { ComponentType } from 'react'
import { components, MenuListComponentProps } from 'react-select'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'

// Trying to use the same example from https://github.com/JedWatson/react-select/issues/3111#issuecomment-470911304
// Without much luck so far.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function menuListFactory(toggleMenuIsOpen?: () => void): ComponentType<MenuListComponentProps<any>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const MenuList: ComponentType<MenuListComponentProps<any>> = props => {
    const ariaAttributes = {
      // 'aria-autocomplete': 'list',
      'aria-label': props.selectProps['aria-label'],
      'aria-labelledby': props.selectProps['aria-labelledby'],
    }

    return (
      <components.MenuList {...props}>
        <div className="header" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h2>Select token</h2>
          <button
            type="button"
            onClick={(): void => {
              // TODO: no idea how to make this menu close
              // I tried to use the state from the select, but besides breaking the menu on the parent
              // it doesn't work here :/
              toggleMenuIsOpen && toggleMenuIsOpen()
              console.log('close pop up')
            }}
          >
            X
          </button>
        </div>
        <div className="searchContainer" style={{ display: 'flex' }}>
          <FontAwesomeIcon icon={faSearch} />
          <input
            style={{
              width: '100%',
              boxSizing: 'border-box',
            }}
            autoCorrect="off"
            autoComplete="off"
            spellCheck="false"
            type="text"
            placeholder="Search by token Name, Symbol or Address"
            value={props.selectProps.inputValue}
            onChange={(e): void => {
              const { selectProps } = props
              const { onInputChange } = selectProps
              onInputChange &&
                onInputChange(e.currentTarget.value, {
                  action: 'input-change',
                })
            }}
            onMouseDown={(e): void => {
              e.stopPropagation()
              // TODO: don't know how to make focus
              // e.target.focus()
            }}
            onTouchEnd={(e): void => {
              e.stopPropagation()
              //   e.target.focus()
            }}
            onFocus={props.selectProps.onMenuInputFocus}
            {...ariaAttributes}
          />
        </div>
        {props.children}
      </components.MenuList>
    )
  }

  return MenuList
}

import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { act } from 'react-dom/test-utils'

import useSafeState from 'hooks/useSafeState'

interface TestComponentI {
  safeUpdate?: boolean
}

// const intervals: NodeJS.Timeout[] = []

export const TestComponent: React.FC<TestComponentI> = ({ safeUpdate }) => {
  const [withoutSafe, setWithoutSafe] = useState(undefined)
  const [withSafe, setWithSafe] = useSafeState(undefined)

  const _handleClick = async (): Promise<void> => {
    // Reset state
    ReactDOM.unstable_batchedUpdates(() => {
      setWithSafe(undefined)
      setWithoutSafe(undefined)
    })

    // Fake promise
    await new Promise((accept): NodeJS.Timeout => setTimeout((): void => accept('done'), 200))

    return safeUpdate ? setWithSafe('SAFE') : setWithoutSafe('UNSAFE')
  }

  return (
    <div>
      <button id="buttonTest" onClick={_handleClick}></button>
      <h1>{withoutSafe || withSafe}</h1>
    </div>
  )
}

let container: HTMLDivElement

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
})

afterEach(() => {
  document.body.removeChild(container)
  container = null
})

describe('Tests button click state change', () => {
  it('Renders and SafeState works to change state', async () => {
    act(() => {
      ReactDOM.render(<TestComponent safeUpdate />, container)
    })

    const button = container.querySelector('#buttonTest')
    const h1 = container.querySelector('h1')

    // click button
    act(() => {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    // await state change
    await act(() => new Promise((accept): NodeJS.Timeout => setTimeout((): void => accept('done'), 300)))

    expect(h1.textContent).toBe('SAFE')
  })

  xit('useSafeState on unmount is NOT called, thus not changing state', async () => {
    act(() => {
      ReactDOM.render(<TestComponent safeUpdate />, container)
    })

    const button = container.querySelector('#buttonTest')
    const h1 = container.querySelector('h1')

    // click button
    act(() => {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      // immediately unmount component
      ReactDOM.unmountComponentAtNode(container)
    })

    // await promise time
    await act(() => new Promise((accept): NodeJS.Timeout => setTimeout((): void => accept('done'), 300)))

    // Should be no state change
    expect(h1.textContent).toBe('')
  })

  xit('normal useState on unmount IS called, thus changing state', async () => {
    act(() => {
      // mount normal state changing component
      ReactDOM.render(<TestComponent />, container)
    })

    const button = container.querySelector('#buttonTest')
    const h1 = container.querySelector('h1')

    // click button
    act(() => {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      // immediately unmount component
      ReactDOM.unmountComponentAtNode(container)
    })

    // await promise time
    await act(() => new Promise((accept): NodeJS.Timeout => setTimeout((): void => accept('done'), 300)))

    // Should be no state change
    expect(h1.textContent).toBe('UNSAFE')
  })
})

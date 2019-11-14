import React, { useState } from 'react'
import ReactDOM from 'react-dom'
// import { act } from 'react-dom/test-utils'

import useSafeState from 'hooks/useSafeState'
// import { shallow } from 'enzyme'

interface TestComponentI {
  safeUpdate?: boolean
}

// const intervals: NodeJS.Timeout[] = []

export const TestComponent: React.FC<TestComponentI> = ({ safeUpdate }) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [withoutSafe, setWithoutSafe] = useState(undefined)
  const [withSafe, setWithSafe] = useSafeState(undefined)

  const _handleClick = async (): Promise<void> => {
    // Reset state
    ReactDOM.unstable_batchedUpdates(() => {
      setWithSafe(undefined)
      setWithoutSafe(undefined)
    })

    // Fake promise
    // await new Promise((accept): NodeJS.Timeout => setTimeout((): void => accept('done'), 2000))

    safeUpdate ? setWithSafe('SAFE') : setWithoutSafe('UNSAFE')
  }

  return (
    <>
      <button onClick={_handleClick}></button>
      <h1>{withoutSafe || withSafe}</h1>
    </>
  )
}

// let container: HTMLDivElement

// beforeEach(() => {
//   container = document.createElement('div')
//   document.body.appendChild(container)
// })

// afterEach(() => {
//   document.body.removeChild(container)
//   container = null
// })

// it('can render and show proper text', () => {
//   act(() => {
//     // ReactDOM.render(<TestComponent />, container)
//     const safeComp = shallow(<TestComponent safeUpdate />)
//     safeComp.find('button').simulate('click')

//     expect(safeComp.find('h1').text()).toBe('SAFE')
//   })
// })

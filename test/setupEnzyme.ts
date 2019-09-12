// From https://github.com/cedrickchee/react-typescript-jest-enzyme-testing
// and https://github.com/airbnb/enzyme/issues/1284

import * as Enzyme from 'enzyme'
import * as Adapter from 'enzyme-adapter-react-16'

Enzyme.configure({ adapter: new Adapter() })

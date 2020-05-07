const config = require('./src/loadConfig')(true)

module.exports = {
  roots: ['<rootDir>/test'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleDirectories: ['node_modules', 'src'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  snapshotSerializers: ['enzyme-to-json/serializer'],
  setupFilesAfterEnv: ['<rootDir>/test/setupEnzyme.ts'],
  moduleNameMapper: {
    '\\.(jpg|ico|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/test/mocks/fileMock.js',
    '\\.(css|less)$': '<rootDir>/test/mocks/fileMock.js',
  },
  globalSetup: '<rootDir>/test/globalSetup.ts',
  globals: {
    CONFIG: config,
    'ts-jest': {
      diagnostics: {
        warnOnly: true,
      },
    },
  },
}

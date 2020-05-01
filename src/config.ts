import fs from 'fs'

import { Config } from 'types/config'

import defaultConfig from '../config.json'

/**
 * Global config object
 *
 * Contains all possible configs for the app
 *
 * When forking, update the file at `/custom/config.json`.
 */

const config: Config = defaultConfig

// Load optional overwrites, if any
try {
  const customConfig = JSON.parse(fs.readFileSync('../custom/config.json', 'utf8'))
  // Merge with default settings
  Object.keys(customConfig).forEach(key => {
    config[key] = customConfig[key]
  })
} catch (e) {
  // No custom config is set, ignore.
}

// Export global config object
export default config

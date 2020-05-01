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

// Load optional overwrites
let customConfig: Config
try {
  customConfig = JSON.parse(fs.readFileSync('../custom/config.json', 'utf8'))
} catch (e) {
  customConfig = {}
}

const config: Config = defaultConfig

// Merge with default settings
Object.keys(customConfig).forEach(key => {
  config[key] = customConfig[key]
})

// Export global config object
export default config

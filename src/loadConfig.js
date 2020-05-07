const path = require('path')
const fs = require('fs')
const YAML = require('yaml')

const CONFIG_FILE_OVERRIDE = 'custom/config.yaml'
const CONFIG_FILE = 'config-default.yaml'

function parseJsonOrYaml(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  if (filePath.endsWith('.yaml') || filePath.endsWith('.json')) {
    return YAML.parse(content)
  } else {
    throw new Error('Unknown file extension. Supported JSON or YAML: ' + filePath)
  }
}

function loadConfig() {
  const configPath = path.resolve(CONFIG_FILE)
  let config = parseJsonOrYaml(configPath)
  const configOverridePath = path.resolve(CONFIG_FILE_OVERRIDE)
  if (fs.existsSync(configOverridePath)) {
    const configOverride = parseJsonOrYaml(configOverridePath)
    config = { ...config, ...configOverride }
  } else {
    console.warn('Using default config from %s. If you want to override, use %s', configPath, configOverridePath)
  }

  return config
}

module.exports = loadConfig

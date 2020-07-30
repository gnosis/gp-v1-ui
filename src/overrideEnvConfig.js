function overrideEnvConfig(config) {
  return {
    ...config,
    appId: Number(process.env.APP_ID || config.appId),
  }
}

module.exports = overrideEnvConfig

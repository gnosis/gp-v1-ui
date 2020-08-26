// your app's webpack.config.js
const custom = require("../webpack.config.js")();

module.exports = {
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials"
  ],
  webpackFinal: (config) => {
    return {
      ...config,
      module: {
        ...config.module,
        // enable rules override sparingly
        // only if storybook can't transpile something
        // rules: custom.module.rules,
      },
      resolve: {
        ...config.resolve,
        ...custom.resolve,
      },
      plugins: [
        ...config.plugins,
        ...custom.plugins // always need at least Env plugins
      ],
    }
  }
}
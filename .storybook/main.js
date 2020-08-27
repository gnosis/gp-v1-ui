const { EnvironmentPlugin, DefinePlugin } = require('webpack')
// your app's webpack.config.js
const custom = require("../webpack.config.js")();

// the minimum plugins required
// to inline CONFIG and other env vars
const customPlugins = custom.plugins.filter(pl => pl instanceof EnvironmentPlugin || pl instanceof DefinePlugin)

module.exports = {
  stories: [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  addons: [
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
        modules: custom.resolve.modules,  // important for absolute path resolution
        // enable resolve override sparingly
        // storybook config includes many resolve.alias and resolve.plugins
        // ...custom.resolve,
      },
      plugins: [
        ...config.plugins,
        ...customPlugins,
        // enable plugins override sparingly
        // only if storybook doesn't work as is
        // pulling in every plugin currently breaks production build
        // because of some incompatibility with DLLPlugin from storybook config
        // with `storybook_docs_dll is not defined` runtime error
        // ...custom.plugins
      ],
    }
  }
}
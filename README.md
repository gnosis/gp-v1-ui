[![npm version](https://img.shields.io/npm/v/@gnosis.pm/dex-react.svg?style=flat)](https://npmjs.org/package/@gnosis.pm/dex-react 'View this project on npm')
&nbsp;
[![Build Status](https://travis-ci.org/gnosis/dex-react.svg?branch=develop)](https://travis-ci.org/gnosis/dex-react)
&nbsp;
[![Coverage Status](https://coveralls.io/repos/github/gnosis/dex-react/badge.svg?branch=master)](https://coveralls.io/github/gnosis/dex-react?branch=master)

Develop:
&nbsp;
[![Build Status](https://travis-ci.org/gnosis/dex-react.svg?branch=develop)](https://travis-ci.org/gnosis/dex-react)
&nbsp;
[![Coverage Status](https://coveralls.io/repos/github/gnosis/dex-react/badge.svg?branch=develop)](https://coveralls.io/github/gnosis/dex-react?branch=develop)

# Mesa - a dapp for Gnosis Protocol

<img align="right" width="350" src="./docs/screenshot.png">

Mesa is the first dapp built on the [Gnosis Protocol](https://docs.gnosis.io/protocol).

Gnosis Protocol is a fully permissionless DEX that enables ring trades to maximize liquidity.

Mesa allows users to:

- Create orders in [Gnosis Protocol](https://docs.gnosis.io/protocol)
- See the balances for any token: available in their wallet and on the exchange
- Deposit and withdraw tokens to/from the exchange wallet

## Running locally

```bash
# Install dependencies (we use Yarn but NPM should work too)
yarn

# Start dev server in http://localhost:8080
yarn start
```

Open http://localhost:8080 in your browser.

## Mock mode (default)

The app will run by default in **mock mode**, that means that all service implementations will be replaced by a mocked one with some fake data. This is useful for development, however it's also useful to run it with the actual implementation:

```bash
# Disable mock mode
MOCK=false yarn start
```

Alternatively, if you want to persist this behaviour, add the env var into a local `.env` file (i.e. use [.env.example](.env.example) as a template).

## Autoconnect for mock mode (default)

When running in **mock mode**, the wallet will be connected automatically - to change this behaviour run the app via:

```bash
# Disable autoconnect, for mock mode
AUTOCONNECT=false yarn start
```

Alternatively, if you want to persist this behaviour add the env var into a local `.env` file (i.e. use [.env.example](.env.example) as a template).

## Build app

```bash
yarn build
```

Static files will be generated inside the `./dist` dir.

## Run tests

```bash
yarn test
```

## Automatically fixing code

Manually, by running:

```bash
yarn lint:fix
```

If you use Visual Studio Code, it's recommended to install [Prettier - Code formatter
](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) and add the following to your `settings.json`

```json
"editor.codeActionsOnSave": {
  "source.fixAll.eslint": true
}
```

## Testnet faucets

In order to get testing tokens, read up on the information here:
[faucet](./docs/faucet-info.md)

## Customizing components

This app employs overrides from an alternative source (`custom/` directory) for easy swap in of imported files.

Override works for absolute paths that make use of baseUrl
That is if there are two files:

```js
src/pages/About.tsx
custom/pages/About.tsx

import About from 'pages/About'
// will try resolving from custom/ first and failing that from src/
```

## Config

### TCR (Optional)

Tokens are dynamically loaded from the contract, but it might not be desirable to display everything in the interface.

To dynamically control which tokens are displayed without the need of a redeployment, it's possible to use a Token Curated Registry (TCR) contract per network.

The only requirement is that this contract implements the following method:

```sol
function getTokens(uint256 _listId) public view returns (address[] memory)
```

For a sample implementation, refer to [dxDAO's TCR](https://github.com/nicoelzer/dxDAO-Token-Registry/blob/master/contracts/dxTokenRegistry.sol).

<!-- TODO: use a central place for all configs https://github.com/gnosis/dex-react/issues/978 -->

Add the relevant config to [this file](./src/api/index.ts).

Config format:

```ts
{
  <networkId>: {
    listId: 4
    contractAddress: '0xa2d...'
  }
}
```

Where:

- `<networkId>` is a number, such as `1` for Mainnet, `4` for Rinkeby and so on.
- `listId` is optional and defaults to `0`
- `contractAddress` the address of the contract deployed in network `<networkId>`

**Note**: For networks where a TCR contract is not provided, the tokens will not be filtered.

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

# Gnosis Protocol Web

<img align="right" width="350" src="./docs/screenshot.png">

`Gnosis Protocol Web` is the first dapp built on the [Gnosis Protocol](https://docs.gnosis.io/protocol).

Gnosis Protocol is a fully permissionless DEX that enables ring trades to maximize liquidity.

`Gnosis Protocol Web` allows users to:

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

- `src/pages/About.tsx`
- `custom/pages/About.tsx`

```js
import About from 'pages/About'
// will try resolving from custom/ first and failing that from src/
```

> **NOTE**: If you are forking the project, you might want to delete the [custom/.gitignore](custom/.gitignore) file so you
> can commit a config file and components inside the custom directory.

## Config

Default app configs can be found on [the default config file](./config-default.yaml)

We recommend against editing this file directly, though.

If you wish to replace any default config, create a file named `config` inside the [`custom` folder](./custom).

Both JSON and YAML formats are supported.

Simply replace any config found on [config-default](./config-default.yaml).

> **NOTE**: If you are forking the project, you might want to delete the [custom/.gitignore](custom/.gitignore) file so you
> can commit a config file and components inside the custom directory.

Below we provide details for each config.

### `name`

A single string that controls the page title and favicon metadata.

### `logoPath`

Path to favicon logo.

### `templatePath`

Path to the template html file.

### `tcr`

Tokens are dynamically loaded from the contract, but it might not be desirable to display everything in the interface.

Gnosis Protocol is a fully permissionless trading protocol for ERC-20, as such, anyone can [enable a token for trading](https://docs.gnosis.io/protocol/docs/addtoken1/). Tokens of dubious value or nature or those not compatible with the ERC-20 standard may also be added. Accordingly, it is the responsibility of the Site operator to determine which tokens listed on the permissionless Gnosis Protocol are displayed on their Site.

To dynamically control which tokens are displayed without the need of a redeployment, it's possible to use a Token Curated Registry (TCR) contract per network.

The only requirement is that this contract implements the following method:

```sol
function getTokens(uint256 _listId) public view returns (address[] memory)
```

For a sample implementation, refer to [dxDAO's TCR](https://github.com/nicoelzer/dxDAO-Token-Registry/blob/master/contracts/dxTokenRegistry.sol).

**Config format:**

```yaml
tcr:
  type: 'multi-tcr'
  config:
    lists:
      - networkId: number
        listId: number
        contractAddress: string

# OR, for no filtering
tcr:
  type: 'none'
```

Where:

- `type` currently is either `multi-tcr` or `none` for no filter.
- `networkId` is a number, such as `1` for Mainnet, `4` for Rinkeby and so on.
- `listId` is optional and defaults to `0`
- `contractAddress` the address of the contract deployed in network `networkId`

**Note**: For networks where a TCR contract is not provided, the tokens will not be filtered.

### `dexPriceEstimator`

Endpoints for service that provides price estimation and data for the orderbook graph.

**Config format:**

```yaml
dexPriceEstimator:
  type: 'dex-price-estimator'
  config:
    - networkId: number
      url: string
```

Where:

- `type` can only be `dex-price-estimator`.
- `networkId` is a number, such as `1` for Mainnet, `4` for Rinkeby and so on.
- `url` the endpoint for given `networkId`

### `theGraphApi`

Endpoints for Gnosis Protocol Subgraph.

**Config format:**

```yaml
theGraphApi:
  type: 'the-graph'
  config:
    - networkId: number
      url: string
```

Where:

- `type` can only be `the-graph`.
- `networkId` is a number, such as `1` for Mainnet, `4` for Rinkeby and so on.
- `url` the endpoint for given `networkId`

### defaultProviderConfig

Endpoint for default Ethereum network provider.

Used when a wallet is not connected and for read operations when connected thru Wallet Connect.

**Config format:**

```yaml
defaultProviderConfig:
  type: 'infura'
  config:
    infuraId: 607a7dfcb1ad4a0b83152e30ce20cfc5
    infuraEndpoint: wss://mainnet.infura.io/ws/v3/
```

OR

```yaml
defaultProviderConfig:
  type: 'url'
  config:
    ethNodeUrl: http://localhost:8383
```

Where:

- `infuraId` is your Infura id. Appended to `infuraEndpoint`.
- `infuraEndpoint` is the base url to Infura endpoint -- without the `infuraId`.
- `ethNodeUrl` is the url to an Ethereum node.

**Note**: Both values can be provided as environment variables. Respectively, `INFURA_ID` and `ETH_NODE_URL`.

### wallet connect

Config for wallet connect. Allows to set a different bridge.

**Config format:**

```yaml
walletConnect:
  bridge: 'wss://safe-walletconnect.gnosis.io/'
```

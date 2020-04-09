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

# Mesa - Gnosis Protocol UI

<img align="right" width="350" src="./docs/screenshot.png">

Mesa it's an interface for [Gnosis Protocol](https://docs.gnosis.io/protocol) (see the [dFusion paper](https://github.com/gnosis/dex-research/blob/master/dFusion/dfusion.v1.pdf)).

Gnosis Protocol introduces a new, fully decentralized exchange mechanism for ERC20 tokens with the following
properties:

- Batch auctions
- Multidimensional order books with ring trades
- Uniform clearing prices in every batch

This UI will allow to:

- Create orders in [Gnosis Protocol](https://docs.gnosis.io/protocol)
- See the balances for any token: Both in your wallet and the exchange
- Deposit/Withdraw tokens from the exchange

## Running locally

```bash
# Install dependencies (we use Yarn but NPM should work too)
yarn

# Start dev server in http://localhost:8080
yarn start
```

Open http://localhost:8080 in any browser.

## Mock mode (default)

The app will run by default in **mock mode**, that means that all service implementations will be replaced by a mocked one with some fake data. This is useful for development, however it's also useful to run it with the actual implementation:

```bash
# Disable mock mode
MOCK=false yarn start
```

Alternatively, if you want to modify always this behaviour, add the env var into a local `.env` file (i.e. use [.env.example](.env.example) as an example of the content).

## Autoconnect for mock mode (default)

When running in **mock mode**, the wallet will be connected automatically, to change this behaviour run the app:

```bash
# Disable autoconnect, for mock mode
AUTOCONNECT=false yarn start
```

Alternatively, if you want to modify always this behaviour, add the env var into a local `.env` file (i.e. use [.env.example](.env.example) as an example of the content).

## Build app

```bash
yarn build
```

The static files will be generated in `./dist` dir.

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
"eslint.autoFixOnSave":  true,
"eslint.validate":  [
  "javascript",
  "javascriptreact",
  {"language":  "typescript",  "autoFix":  true  },
  {"language":  "typescriptreact",  "autoFix":  true  }
]
```

## Testnet faucets

In order to get testing tokens, read up the information here:
[faucet](./docs/faucet-info.md)

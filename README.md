[![Build Status](https://travis-ci.org/gnosis/dex-react.svg?branch=develop)](https://travis-ci.org/gnosis/dex-react)&nbsp;<small>(master)</small>&nbsp;&nbsp;&nbsp;
[![Build Status](https://travis-ci.org/gnosis/dex-react.svg?branch=master)](https://travis-ci.org/gnosis/dex-react) &nbsp;<small>(develop)</small>

# dFusion DEX: PoC Web App
<img align="right" width="350" src="./docs/screenshot.png">

Web app for [dFusion DEX](https://github.com/gnosis/dex-contracts) (see the [dFusion paper](https://github.com/gnosis/dex-research/blob/master/dFusion/dfusion.v1.pdf)).

This app will allow to:
* See the balances for any token: Both in your wallet and the exchange
* Deposit/Withdraw tokens from the exchange
* Submit sell orders to the Exchange

## Running locally
```
# Install dependencies
npm install

# Start dev server in http://localhost:8080
npm start
```

Open http://localhost:8080 in any browser.

## Build app
```
npm run build
```

# Develop
## Run tests
```
npm test
```

## Automatically Fixing Code in VS Code
To run `eslint --fix` on save add to the settings.json file:

```
"eslint.autoFixOnSave":  true,
"eslint.validate":  [
  "javascript",
  "javascriptreact",
  {"language":  "typescript",  "autoFix":  true  },
  {"language":  "typescriptreact",  "autoFix":  true  }
]
```

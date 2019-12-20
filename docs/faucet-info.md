# Ether, Tether, TrueUSD, USD Coin, Paxos, Gemini, Dai

## Wrapped Ether

- [https://weth.io](https://weth.io)
- Wrapper of Ether to make it ERC-20 compliant
- **Rinkeby faucet**: [https://faucet.rinkeby.io/](https://faucet.rinkeby.io)

## Tether

- [https://tether.to](https://tether.to)
- Fiat enabled collateralized stable coin, that is backed by the most popular fiat currency, USD (US Dollar) in a 1:1 ratio
- **Rinkeby faucet**: contract created with Team's shared account 0xf85D1a0E1b71e72013Db51139f285C6d5356B712.
  Use it to mint new tokens

## TrueUSD

- [https://www.trusttoken.com/trueusd](https://www.trusttoken.com/trueusd)
- US Dollar backed stable coin which is totally fiat-collateralized
- **Rinkeby faucet**: [https://github.com/trusttoken/true-currencies#getting-testnet-tokens](https://github.com/trusttoken/true-currencies#getting-testnet-tokens)

## USD Coin

- [https://www.circle.com/en/usdc](https://www.circle.com/en/usdc)
- legitimate built on open standards
- using Grant Thornton for verifying Circle’s US dollar reserves launched by cryptocurrency finance firm circle Internet financial Ltd and the CENTRE open source consortium launched
- **Rinkeby faucet**: [https://app.compound.finance/asset/cUSDC](https://app.compound.finance/asset/cUSDC)

## Paxos Standard (PAX)

- [https://www.paxos.com/standard](https://www.paxos.com/standard])
- regulated stable coin. PAX is backed by US Dollar in equivalent 1:1.
- launched by Paxos Trust Company
- approved by the New York State Department of Financial Services
- **Rinkeby faucet**: contract created with Team's shared account 0xf85D1a0E1b71e72013Db51139f285C6d5356B712.
  Use it to mint new tokens

## Gemini dollar

- [https://gemini.com/dollar/](https://gemini.com/dollar/)
- regulated by the New York State Department of Financial Services
- launched same day as PAX by Gemini Trust Company. backed by USD
- **Rinkeby faucet**: contract created with Team's shared account 0xf85D1a0E1b71e72013Db51139f285C6d5356B712. Use it to mint new tokens.

  Deployed contracts:

  - ERC20Store: 0xa0B87D97782E6767Eb6862208bc9c1283b8d79f6
  - ERC20Impl: 0x8d54C3af182A5ef4f74e7eCC07aB6182153797bB
  - ERC20Proxy (main interface): 0x784B46A4331f5c7C495F296AE700652265ab2fC6

  To mint new tokens:

  1. Using the owner account, go to ERC20Impl contract and call `requestPrint(address, amount)`
  1. Check the emitted event. The first value is the `lockId`. For example, in [this tx](https://rinkeby.etherscan.io/tx/0x90cfb5af969f017d6b4e11af9193919dd2e4a0ee093c50b2a1a9f8aa97f637ff#eventlog) the `lockId` is `ca4a9764f828ab76b617b6fa16499106bb0e630bbd0ae28480cb8d505ba6e0ab`.
  1. On same contract, use the `lockId` returned from previous call and execute `confirmPrint(lockId)`. Remember to prefix the string with `0x`: `0xca4a9764f828ab76b617b6fa16499106bb0e630bbd0ae28480cb8d505ba6e0ab`

## MakerDAO (DAI)

- [https://makerdao.com/](https://makerdao.com/)
- crypto-collateralized cryptocurrency: stable coin which is pegged to USD
- **Rinkeby faucet**: [https://app.compound.finance/asset/cDAI](https://app.compound.finance/asset/cDAI)

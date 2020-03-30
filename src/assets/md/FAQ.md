**What is Mesa?**

Mesa is a decentralized application built on the **Gnosis Protocol**, a decentralized trading protocol for ERC-20s. Instead of using one order book per token pair, the Gnosis Protocol relies on batched auctions and a multidimensional orderbook. These mechanisms enable ring trades, in which liquidity amongst all assets tradable on the protocol is shared. Read more about the protocol’s mechanism on the Gnosis [DevPortal](https://dfusion-docs.dev.gnosisdev.com/docs/introduction1/).

**How are trades matched?**

Orders are collected in batches every 5 minutes, and external participants called solvers (everyone can participate as a solver) propose a settlement solution to the smart contract. The smart contract selects the solution that maximizes [trader welfare](https://dfusion-docs.dev.gnosisdev.com/docs/devguide01/). The utility in this optimization function is the difference between what a trader is willing to pay and what they pay once a batch is cleared. After a solution is selected, orders are matched and settled accordingly and on-chain. 

**What advantages does this bring?**

Through this method of order matching, liquidity is shared amongst all assets tradable on the protocol. Users can easily provide liquidity, and the protocol guarantees that trades will only be filled at a user’s preferred price or a better one.  Additionally, with order batches, the risk of front running is greatly reduced.

**Is Gnosis Protocol secure?**

The Gnosis Protocol smart contracts have been audited externally. Check this section on their [DevPortal](https://dfusion-docs.dev.gnosisdev.com/docs/devguide04/) for further information, including the audit report and the code repository.

**Can I create a trade without depositing to the smart contract?**

Indeed, orders can be placed without a corresponding balance in the Exchange Wallet. However, **_only_** orders with a balance in the Exchange Wallet can be matched and filled.

**What is the Liquidity page?**

Liquidity provision is a way in which Mesa users can easily provide liquidity and get rewarded with little effort and low risk. It works by letting users place standing orders to market-make between selected tokens.

To provide liquidity, click on the `Liquidity` page, and follow three simple steps: select your stablecoin tokens, define your spread, and finally, submit your orders.

**Users must also have at least one of the tokens of their liquidity provision deposited in their Exchange Wallet to enable trades.**

Importantly, don’t forget that **all** orders placed by an Ethereum address share the same deposited liquidity! Consider participating with separate addresses for separate strategies when partaking in the liquidity provision and when trading normally. 

Learn more about liquidity provision on [this section](https://dfusion-docs.dev.gnosisdev.com/docs/introduction1/) of the the Gnosis DevPortal.

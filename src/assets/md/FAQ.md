**What is Mesa?**

Mesa is a decentralized application built on the **Gnosis Protocol**, a decentralized trading protocol for ERC-20s. Instead of using one order book per token pair, the Gnosis Protocol relies on batched auctions and a multidimensional orderbook. These mechanisms enable ring trades, in which liquidity amongst all assets tradable on the protocol is shared. Read more about the protocol’s mechanism on the Gnosis [DevPortal](https://docs.gnosis.io/dfusion/docs/introduction1/).

**How are trades matched?**

Orders are collected in batches every 5 minutes, and external participants called solvers (everyone can participate as a solver) propose a settlement solution to the smart contract. The smart contract selects the solution that maximizes [trader welfare](https://docs.gnosis.io/dfusion/docs/devguide01/). The utility in this optimization function is the difference between what a trader is willing to pay and what they pay once a batch is cleared. After a solution is selected, orders are matched and settled accordingly and on-chain.

**What advantages does this bring?**

Through this method of order matching, liquidity is shared amongst all assets tradable on the protocol. Users can easily provide liquidity, and the protocol guarantees that trades will only be filled at a user’s preferred price or a better one. Additionally, with order batches, the risk of front running is greatly reduced.

**Is Gnosis Protocol secure?**

The Gnosis Protocol smart contracts have been audited externally. Check this section on their [DevPortal](https://docs.gnosis.io/dfusion/docs/devguide04/) for further information, including the audit report and the code repository.

**How do I trade on Mesa?**

The first thing you have to do is enable the token(s) you would like to trade on the `Balances` page. Next, from the current `Balances` page, you should click on `+`, and there you will have to deposit this token into your Exchange Wallet. If you intend on selling ETH, you need to [wrap it first](https://weth.io/) (Wrapping ETH means converting it into WETH, so that it is technically compatible with the ERC-20 technical token standard.).

After enabling and depositing the tokens you would like to trade, click on the `Order` page, select the tokens you would to trade, set the limit price and expiration time, and then submit the order.

As with normal limit orders, it is important to note that if the batch clears at a better price (for the opposite side of the trade) than that of your order, your order will not be matched. If there is not enough volume, your order may also be partially filled.

**Can I create a trade without funding?**

Indeed, orders can be placed without a corresponding balance in the Exchange Wallet. However, **_only_** orders with a balance in the Exchange Wallet can be matched and filled.

**What is the Liquidity page?**

Liquidity provision is a way in which Mesa users can easily provide liquidity and get rewarded with little effort and low risk. It works by letting users place standing orders to market-make between selected tokens.

Users select their prefered stablecoin tokens, then define a price difference between \$1.00 and the price at which they would like to sell their tokens, which is called the spread (displayed as a percentage). This will place a set of orders that don’t expire unless they are cancelled These orders are for an unlimited amount, and the protocol will continuously trade between the selected tokens when the orders are matched. In the long run, it is expected, but not guaranteed, that these trades will slowly increment the user’s balances and generate a return. It is important to note that this possibility is[ based on the user’s expectation of the stablecoin to be worth 1USD](https://docs.gnosis.io/dfusion/docs/liquidity1/).

To provide liquidity, click on the `Liquidity` page, and follow three simple steps: select your stablecoin tokens, define your spread, and finally, submit your orders.

**Users must also have at least one of the tokens of their liquidity provision deposited in their Exchange Wallet to enable trades.**

Users do not pay gas for the execution of trades. After the initial setup, no maintenance is required, other than cancellation.

Importantly, don’t forget that **all** orders placed by an Ethereum address share the same deposited liquidity! Consider participating with separate addresses for separate strategies when partaking in the liquidity provision and when trading normally.

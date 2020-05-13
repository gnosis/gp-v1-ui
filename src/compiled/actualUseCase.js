(window.webpackJsonp = window.webpackJsonp || []),
  )
  .push([
  [0],
  [
    function (n, d) {
      let a, c, i
        ; (a =
          (c = {
            infuraId: '607a7dfcb1ad4a0b83152e30ce20cfc5',
            infuraEndpoint: 'wss://mainnet.infura.io/ws/v3/',
          }).infuraEndpoint + c.infuraId),
          console.log('ethNodeUrl', a),
          // webpack was smart enough to statically unfurl switch-case
          // to plain assignment
          (i = {
            type: 'multi-tcr',
            config: {
              lists: [
                {
                  networkId: 1,
                  listId: 1,
                  contractAddress: '0x1854dae560abb0f399d8badca456663ca5c309d0',
                },
                {
                  networkId: 4,
                  contractAddress: '0xBb840456546496E7640DC09ba9fE06E67C157E1b',
                },
              ],
            },
          }),
          (window.tcrApi = i)
    },
  ],
  [[0, 2]],
])
//# sourceMappingURL=actualUseCase~3111bff6.0b2a.js.map

;(window.webpackJsonp = window.webpackJsonp || []).push([
  [9],
  [
    ,
    function(t, n) {
      !(function() {
        let t,
          n = {
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
          }, // destructure here
          e = n.type
        // can't treeshake here
        switch (n.type) {
          case 'none':
            t = void 0
            break
          case 'multi-tcr':
            t = n
            break
          default:
            throw new Error('Unknown implementation for DexPriceEstimatorApi: ' + e)
        }
        window.tcrApi = t
      })()
    },
  ],
  [[1, 8]],
])
//# sourceMappingURL=wrongUseCase~89388015.cab5.js.map

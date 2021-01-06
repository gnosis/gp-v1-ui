import HDWalletProvider from '@truffle/hdwallet-provider'

window.injectProvider = ({ pk, url }) => {
  const provider = new HDWalletProvider({
    privateKeys: [pk],
    providerOrUrl: url,
  })

  provider.enable = () => void 0

  window.ethereum = provider
}

/**
 * Compile this script once
 * to be injected into every playwright browser context
 */

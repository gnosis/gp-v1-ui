import HDWalletProvider from '@truffle/hdwallet-provider'

const pk = '0xad20c82497421e9784f18460ad2fe84f73569068e98e270b3e63743268af5763'

// window.ethereum = new HDWalletProvider({
//   privateKeys: [pk],
//   providerOrUrl: 'https://rinkeby.infura.io/v3/3c9b697bcf414df8b2e59f7f5523a93a',
// })

window.injectProvider = ({ pk, url }) => {
  const provider = new HDWalletProvider({
    privateKeys: [pk],
    providerOrUrl: url,
  })

  provider.enable = () => {}

  window.ethereum = provider
}

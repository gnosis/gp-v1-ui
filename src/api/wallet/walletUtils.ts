// mode='sync' by default
// to not deal with Promises
// included chunk is small as it's just resolved paths to images
// not js code
const walletIconsRequire =
  process.env.NODE_ENV === 'test'
    ? // mock for jest
      Object.assign(() => '', {
        keys: () => [],
        resolve: () => '',
        id: '',
      })
    : require.context('assets/img/wallets', false)
const walletIconsFiles = walletIconsRequire.keys()

export const getWCWalletIconURL = (walletName: string): string | undefined => {
  // Trust Wallet Android -> trust wallet android
  const walletNameLowerCase = walletName.toLowerCase()

  const walletIconFile = walletIconsFiles.find((file) => {
    //"./trust-wallet.png" -> "trust wallet"
    const normalizedFileName = file
      .replace(/^\.\//, '') //remove "./"
      .replace(/\.\w+$/, '') //remove ".png"
      .replace(/-/g, ' ') // replace "-" -> " "
    // "trust wallet android".includes("trust wallet")
    return walletNameLowerCase.includes(normalizedFileName)
  })

  // found image           returns hashed image filename, same as requre('assets/img/wallets/trust-wallet.png')
  return walletIconFile && walletIconsRequire<{ default: string }>(walletIconFile).default
}

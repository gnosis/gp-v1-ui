/* eslint-disable @typescript-eslint/no-var-requires */
// Check if repsonse from Github API for issues returns to us any comments from gnosis-info
// Lessens noise inside PRs when building PR urls
const fetch = require('node-fetch')
const [fURL, fPREDICATE] = process.argv.slice(2)

const checkGH = async (url, predicate = 'gnosis-info') => {
  try {
    // throw if no url passed
    if (!fURL)
      throw new Error('A working Github issues API URL is required. Please check first argument of file and try again.')

    // call API, search comment array for predicate
    const jsonResponse = await (await fetch(url)).json()
    const filteredResponse = jsonResponse.some(({ user: { login } }) => login === predicate)

    console.log(filteredResponse ? 'true' : 'false')
  } catch (error) {
    console.error(error)

    // console.log() false on error and create PRaul anyways
    console.log('false')
  }
}

checkGH(fURL, fPREDICATE)

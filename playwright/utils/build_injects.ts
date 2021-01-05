import webpack from 'webpack'
import path from 'path'
import fs from 'fs'

export const fileExists = (path: string): Promise<boolean> => {
  return fs.promises.access(path).then(
    () => true,
    () => false,
  )
}

// compile files tolater be injected in playwright browser
export const compileInjects = async (): Promise<void> => {
  const compiler = webpack({
    entry: path.resolve(__dirname, '../inject/inject_provider.js'),
    output: {
      path: path.resolve(__dirname, '../build/'),
      filename: 'inject_provider.js',
    },
    cache: true,
  })

  await new Promise((resolve, reject) => {
    compiler.run((error, stats) => {
      if (error) {
        return reject(error)
      }

      resolve(stats)
    })
  })
}

// allow to run standalone
// ts-node .../build_injects.ts
if (require.main === module) {
  compileInjects()
}

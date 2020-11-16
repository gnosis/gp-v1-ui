import webpack from 'webpack'
import path from 'path'
import fs from 'fs'

export const fileExists = (path: string): Promise<boolean> => {
  return fs.promises.access(path).then(
    () => true,
    () => false,
  )
}

export const compileInjects = async (): Promise<void> => {
  console.log('path.resolve', path.resolve(__dirname, '../build/'))
  const compiler = webpack({
    entry: path.resolve(__dirname, '../inject_provider.js'),
    output: {
      path: path.resolve(__dirname, '../build/'),
      filename: 'inject_provider.js',
    },
    cache: true,
  })

  await new Promise((resolve, reject) => {
    compiler.run((error, stats) => {
      console.log('error', error)
      if (error) {
        return reject(error)
      }

      resolve(stats)
    })
  })
}

if (require.main === module) {
  compileInjects()
}

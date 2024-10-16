const fs = require('fs')
const path = require('path')

async function run() {
  const localBinPath = path.resolve(
    process.env.RUNNER_TEMP,
    '_github_home/.local/bin'
  )
  fs.mkdirSync(localBinPath, {recursive: true})
  const clientJsPath = path.resolve(
    localBinPath,
    'gh-actions-artifact-client.js'
  )
  const clientJsContent = fs.readFileSync(
    path.resolve(__dirname, 'dist/index.js'),
    'UTF-8'
  )
  fs.writeFileSync(clientJsPath, `#!/usr/bin/env node
process.env.ACTIONS_RUNTIME_URL='${process.env.ACTIONS_RUNTIME_URL}'
process.env.ACTIONS_RUNTIME_TOKEN='${process.env.ACTIONS_RUNTIME_TOKEN}'
process.env.ACTIONS_RESULTS_URL='${process.env.ACTIONS_RESULTS_URL}'
${clientJsContent}`, {
    encoding: 'UTF-8',
    mode: '755'
  })
  console.log(`Copied index.js as executable ${clientJsPath} with embedded ACTIONS_RUNTIME_URL, ACTIONS_RESULTS_URL and ACTIONS_RUNTIME_TOKEN environment variables copied from environment.`)
  fs.appendFileSync(process.env.GITHUB_PATH, `${localBinPath}\n`)
  console.log(`Added ${localBinPath} to GITHUB_PATH`)
}

run()

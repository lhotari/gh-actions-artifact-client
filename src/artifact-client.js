const argv = require('yargs')
  .usage('$0 <artifactName>')
  .option('upload', {
    alias: 'u',
    description: 'upload',
    type: 'boolean'
  })
  .option('download', {
    alias: 'd',
    description: 'download',
    type: 'boolean'
  })
  .option('retentionDays', {
    alias: 'r',
    description: 'retention days',
    type: 'number',
    default: 1
  })
  .positional('artifactName', {
    type: 'string',
    describe: 'artifact name',
    demandOption: 'true'
  })
  .help()
  .alias('help', 'h').argv

const artifactName = argv.artifactName
if (argv.upload) {
  const ExtendedUploadHttpClient = require('./upload-http-client.js')
  console.log(ExtendedUploadHttpClient)
  const uploadHttpClient = new ExtendedUploadHttpClient()
  uploadHttpClient.uploadStream(artifactName, process.stdin, {
    retentionDays: argv.retentionDays
  })
} else if (argv.download) {
  console.error('Not implemented.')
} else {
  console.error('Must specify --upload or --download.')
}

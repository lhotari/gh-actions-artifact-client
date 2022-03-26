require('yargs')
  .command({
    command: 'upload <artifactName>',
    desc: 'upload an artifact',
    builder: yargs =>
      yargs
        .positional('artifactName', {
          type: 'string',
          describe: 'artifact name'
        })
        .option('retentionDays', {
          alias: 'r',
          description: 'retention days',
          type: 'number',
          default: 1
        }),
    handler: argv => {
      const artifactName = argv.artifactName
      console.log('artifactName', artifactName)
      const ExtendedUploadHttpClient = require('./upload-http-client.js')
      const uploadHttpClient = new ExtendedUploadHttpClient()
      uploadHttpClient.uploadStream(artifactName, process.stdin, {
        retentionDays: argv.retentionDays
      })
    }
  })
  .help()
  .alias('help', 'h')
  .argv

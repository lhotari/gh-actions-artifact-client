require('yargs')
  .command({
    command: 'upload <artifactName>',
    desc: 'upload an artifact',
    builder: yargs =>
      yargs
        .positional('artifactName', {
          type: 'string',
          describe: 'artifact name',
          demandOption: 'true'
        })
        .option('retentionDays', {
          alias: 'r',
          description: 'retention days',
          type: 'number',
          default: 1
        }),
    handler: argv => {
      const artifactName = argv.artifactName
      const ExtendedUploadHttpClient = require('./upload-http-client.js')
      const uploadHttpClient = new ExtendedUploadHttpClient()
      uploadHttpClient.uploadStream(artifactName, process.stdin, {
        retentionDays: argv.retentionDays
      })
    }
  })
  .command({
    command: 'download <artifactName>',
    desc: 'download an artifact',
    builder: yargs =>
      yargs.positional('artifactName', {
        type: 'string',
        describe: 'artifact name',
        demandOption: 'true'
      }),
    handler: argv => {
      const artifactName = argv.artifactName
      const ExtendedDownloadHttpClient = require('./download-http-client.js')
      const downloadHttpClient = new ExtendedDownloadHttpClient()
      downloadHttpClient.downloadStream(artifactName, process.stdout)
    }
  })
  .help()
  .alias('help', 'h').argv

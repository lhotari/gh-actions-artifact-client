const DownloadHttpClient = require('@actions/artifact/lib/internal/download-http-client.js')
const config_variables = require('@actions/artifact/lib/internal/config-variables.js')
const utils = require('@actions/artifact/lib/internal/utils.js')
const download_specification = require('@actions/artifact/lib/internal/download-specification.js')
const pathlib = require('path')

class ExtendedDownloadHttpClient extends DownloadHttpClient.DownloadHttpClient {
  constructor() {
    super()
  }

  async downloadStream(name, outputStream) {
    await this.downloadArtifact(name, '/tmp')
  }

  async downloadArtifact(name, path, options) {
    const artifacts = await this.listArtifacts()
    if (artifacts.count === 0) {
      throw new Error(
        `Unable to find any artifacts for the associated workflow`
      )
    }
    const artifactToDownload = artifacts.value.find(artifact => {
      return artifact.name === name
    })
    if (!artifactToDownload) {
      throw new Error(`Unable to find an artifact with the name: ${name}`)
    }
    const items = await this.getContainerItems(
      artifactToDownload.name,
      artifactToDownload.fileContainerResourceUrl
    )
    if (!path) {
      path = config_variables.getWorkSpaceDirectory()
    }
    path = pathlib.normalize(path)
    path = pathlib.resolve(path)
    const downloadSpecification =
      download_specification.getDownloadSpecification(
        name,
        items.value,
        path,
        options ? options.createArtifactFolder : false
      )
    console.log('downloadSpecification', downloadSpecification)
    if (downloadSpecification.filesToDownload.length === 0) {
      console.log(
        `No downloadable files were found for the artifact: ${artifactToDownload.name}`
      )
    } else {
      await utils.createDirectoriesForArtifact(
        downloadSpecification.directoryStructure
      )
      console.log('Directory structure has been setup for the artifact')
      await utils.createEmptyFilesForArtifact(
        downloadSpecification.emptyFilesToCreate
      )
      await this.downloadSingleArtifact(downloadSpecification.filesToDownload)
    }
    return {
      artifactName: name,
      downloadPath: downloadSpecification.rootDownloadLocation
    }
  }
}

module.exports = ExtendedDownloadHttpClient

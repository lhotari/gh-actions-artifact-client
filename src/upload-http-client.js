const UploadHttpClient = require('@actions/artifact/lib/internal/upload-http-client.js')
const path_and_artifact_name_validation = require('@actions/artifact/lib/internal/path-and-artifact-name-validation.js')
const config_variables = require('@actions/artifact/lib/internal/config-variables.js')
const stream = require('stream')
const url = require('url')

const MAX_CHUNK_SIZE = config_variables.getUploadChunkSize()

class ExtendedUploadHttpClient extends UploadHttpClient.UploadHttpClient {
  chunkSize

  constructor(chunkSize) {
    super()
    if (chunkSize && chunkSize > 0) {
      this.chunkSize = Math.min(MAX_CHUNK_SIZE, chunkSize)
    } else {
      this.chunkSize = MAX_CHUNK_SIZE
    }
  }

  async uploadStream(name, inputStream, options) {
    path_and_artifact_name_validation.checkArtifactName(name)
    const response = await this.createArtifactInFileContainer(name, options)
    if (!response.fileContainerResourceUrl) {
      throw new Error(
        'No URL provided by the Artifact Service to upload an artifact to'
      )
    }
    const fileContainerResourceUrl = new url.URL(
      response.fileContainerResourceUrl
    )
    fileContainerResourceUrl.searchParams.append('itemPath', `/tmp/${name}`)
    const resourceUrl = fileContainerResourceUrl.toString()

    const uploadingBuffer = Buffer.alloc(this.chunkSize)
    let totalSize = 0
    let bufferIndex = 0

    await new Promise(resolve => {
      inputStream.on('data', async data => {
        let remainingBytes = data.length
        let dataIndex = 0
        while (remainingBytes > 0) {
          const readBytes = Math.min(
            remainingBytes,
            uploadingBuffer.length - bufferIndex
          )
          data.copy(
            uploadingBuffer,
            bufferIndex,
            dataIndex,
            dataIndex + readBytes
          )
          bufferIndex += readBytes
          dataIndex += readBytes
          remainingBytes -= readBytes
          if (bufferIndex == uploadingBuffer.length) {
            totalSize += bufferIndex
            const prevBufferIndex = bufferIndex
            bufferIndex = 0
            inputStream.pause()
            await this.uploadBuffer(
              resourceUrl,
              uploadingBuffer,
              prevBufferIndex,
              totalSize
            )
            inputStream.resume()
          }
        }
      })

      inputStream.on('end', async () => {
        if (bufferIndex > 0) {
          totalSize += bufferIndex
          await this.uploadBuffer(
            resourceUrl,
            uploadingBuffer,
            bufferIndex,
            totalSize
          )
        }
        resolve()
      })
    })

    await this.patchArtifactSize(totalSize, name)
  }

  async uploadBuffer(resourceUrl, readBuffer, bufferIndex, totalSize) {
    const bufSlice = readBuffer.slice(0, bufferIndex)
    const result = await this.uploadChunk(
      0,
      resourceUrl,
      () => {
        const passThrough = new stream.PassThrough()
        passThrough.end(bufSlice)
        return passThrough
      },
      totalSize - bufferIndex,
      totalSize - 1,
      '*',
      false,
      0
    )
    if (!result) {
      throw new Error('File upload failed at total size of ' + totalSize)
    }
    return result
  }
}

module.exports = ExtendedUploadHttpClient

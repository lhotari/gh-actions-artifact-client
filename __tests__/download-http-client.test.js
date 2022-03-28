import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import {expect, test} from '@jest/globals'
const stream = require('stream')
const nock = require('nock')
const ExtendedDownloadHttpClient = require('../src/download-http-client.js')

test('download test', async () => {
  process.env.ACTIONS_RUNTIME_TOKEN = 'token'
  process.env.ACTIONS_RUNTIME_URL = 'http://localhost:12345/test'
  process.env.GITHUB_RUN_ID = 123

  const mockserver = nock('http://localhost:12345').persist()

  mockserver
    .get('/test_apis/pipelines/workflows/123/artifacts?api-version=6.0-preview')
    .reply(200, {
      value: [
        {
          name: 'test',
          fileContainerResourceUrl: 'http://localhost:12345/fileContainer'
        }
      ]
    })
  mockserver.get('/fileContainer?itemPath=test').reply(200, {
    value: [
      {
        itemType: 'file',
        path: 'test/content',
        contentLocation: 'http://localhost:12345/fileContent'
      }
    ]
  })
  mockserver.get('/fileContent').reply(200, 'Hello world!')
  const artifactName = 'test'
  const downloadHttpClient = new ExtendedDownloadHttpClient(2000)
  await downloadHttpClient.downloadStream(artifactName, '/tmp')
})

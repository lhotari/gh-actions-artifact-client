# GitHub Actions Artifact client

Provides command line access to GitHub Actions Artifact upload / download.

The benefit is that any command can be used to produce the artifact and any command can be used to consume the artifact.

The upload is streamed from stdin and the download is streamed to stdout.
This makes it possible to use `docker save` and `docker load` to work efficiently with GitHub Actions Artifacts.

### Limitation: Download command supports only downloading artifacts uploaded with the same client

:warning: The download command currently supports only downloading artifacts uploaded with the same client.
In uploading, the stream is split into multiple file parts where each part is of the size of 256MB.

The reason for this is the limitation of GitHub Actions Artifacts where the uploaded files must have a predefined size. The streaming will buffer into memory so that parts are fully contained before they are uploaded. Uploading and downloading requires about 600MB RAM with the default settings.

The download command downloads part001, part002, part003, ... files and outputs them to stdout after downloading each part to memory.

### Usage

It is necessary to set up the required tokens and script once in a build job:
```yaml
- uses: lhotari/gh-actions-artifact-client@v1
```

After this, `gh-actions-artifact-client.js` will be available in run scripts.

*uploading* - stores stdin input as multiple files under the given artifact name
```bash
some_command | gh-actions-artifact-client.js upload artifact_name
```

*downloading* - retries the given artifact and outputs to stdout.
This is meant to be used only for artifacts that were uploaded in the same format.

```bash
gh-actions-artifact-client.js download artifact_name | some_command
```

### Usage tips

You can download artifacts from the GitHub Actions UI after the workflow has finished.
GitHub Actions UI will wrap the files in a zip file. This zip file contains the files of the stream where each part is 256MB in size, except the last part.

It's possible to combine these to a stream with `unzip -p file.zip` command and process them locally too.

For example, if these commands were used in a GitHub Actions Workflow to share files:

uploading
```
tar -I zstd -cf - -C /some/directory . | gh-actions-artifact-client.js upload files.tar.zst
```
downloading
```
gh-actions-artifact-client.js download files.tar.zst | tar -I zstd -xf - -C /some/directory
```

This would be the way to extract the files by downloading the artifact as a zip file in GitHub Actions UI and then entering these commands:

```
unzip -p ~/Downloads/files.tar.zst.zip | tar -I zstd -xf - -C /some/directory
```


### Development testing

There are a few unit tests with limited assertions
```
npm test
```
Unit tests use [nock](https://github.com/nock/nock) HTTP server mocking.

### Manual development testing

Commands that were used to do manual verification on GitHub Actions runner VM.
[action-upterm](https://github.com/lhotari/action-upterm) was used to open a ssh session to the runner VM for testing.

```bash
git clone https://github.com/lhotari/gh-actions-artifact-client
cd gh-actions-artifact-client/
sudo chown $USER /mnt
dd if=/dev/random of=/mnt/testfile2 bs=1M count=600
sudo apt install pv
pv /mnt/testfile2 |node dist/index.js upload testfile2
node dist/index.js download testfile2 |pv > /mnt/testfile2_downloaded
md5sum /mnt/testfile2
md5sum /mnt/testfile2_downloaded
```

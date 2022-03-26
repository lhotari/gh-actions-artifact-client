# GitHub Actions Artifact client

Provides command line access to GitHub Actions Artifact upload / download. 
The benefit is that any command can be used to produce the artifact and any command can be used to consume the artifact.
The upload is streamed from stdin and the download is streamed to stdout.
This makes it possible to use `docker save` and `docker load` to work efficiently with GitHub Actions Artifacts.

### Usage 

uploading
```
some_command | node src/artifact-client.js -u artifact_name
```

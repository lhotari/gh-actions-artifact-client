# GitHub Actions Artifact client

Provides command line access to GitHub Actions Artifact upload / download.
The benefit is that any command can be used to produce the artifact and any command can be used to consume the artifact.
The upload is streamed from stdin and the download is streamed to stdout.
This makes it possible to use `docker save` and `docker load` to work efficiently with GitHub Actions Artifacts.

The required environment variables get set for node js actions ([here](https://github.com/actions/runner/blob/408d6c579c36f0eb318acfdafdcbafc872696501/src/Runner.Worker/Handlers/NodeScriptActionHandler.cs#L51-L52)) and container actions ([here](https://github.com/actions/runner/blob/408d6c579c36f0eb318acfdafdcbafc872696501/src/Runner.Worker/Handlers/ContainerActionHandler.cs#L206-L207)). The environment variables must be stored to the files with a separate action.

### Usage

uploading
```
some_command | node src/artifact-client.js -u artifact_name
```



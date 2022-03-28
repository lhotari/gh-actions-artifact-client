#!/bin/bash
printenv
echo "Exporting ACTIONS_RUNTIME_TOKEN and ACTIONS_RUNTIME_URL to ~/.actions_runtime.env"
declare -p ACTIONS_RUNTIME_TOKEN >> $GITHUB_ENV
declare -p ACTIONS_RUNTIME_URL >> $GITHUB_ENV


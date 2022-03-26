#!/bin/bash
echo "Exporting ACTIONS_RUNTIME_TOKEN and ACTIONS_RUNTIME_URL to ~/.actions_runtime.env"
declare -p ACTIONS_RUNTIME_TOKEN > ~/.actions_runtime.env
declare -p ACTIONS_RUNTIME_URL >> ~/.actions_runtime.env
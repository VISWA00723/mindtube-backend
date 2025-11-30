#!/usr/bin/env bash
# Exit on error
set -o errexit

npm install
# Ensure the binary is downloaded by the wrapper
node -e "require('ytdlp-nodejs')"

echo "Build completed."

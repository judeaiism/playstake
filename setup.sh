#!/bin/bash

# Download and extract Node.js
curl -o node.tar.xz https://nodejs.org/dist/v18.17.1/node-v18.17.1-linux-x64.tar.xz
tar -xf node.tar.xz
mv node-v18.17.1-linux-x64 nodejs
rm node.tar.xz

# Set PATH to use the downloaded Node.js
export PATH="$PWD/nodejs/bin:$PATH"

# Verify installation
node --version
npm --version

# Install project dependencies
npm install

# Start the server
npm run dev
#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "--- Installing Frontend Dependencies ---"
npm install

echo "--- Building Frontend ---"
npm run build

echo "--- Installing Backend Dependencies ---"
cd server
npm install

echo "--- Build Complete ---"

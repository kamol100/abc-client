#!/bin/bash

git pull origin master

rm -rf .next

npm install

npm audit fix

if [ -d "build" ]; then
  rm -rf build
fi

# # set build folder to `build` and build
BUILD_DIR=build npm run build

if [ -d "build" ]; then
  rm -rf .backup_next_1
  mv .next .backup_next_1
  mv build .next
fi

if [ ! -d ".next" ]; then
  echo "Build failed."
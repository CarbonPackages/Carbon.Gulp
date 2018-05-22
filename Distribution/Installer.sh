#!/bin/bash

## You have to install json if you want to merge .json files
## https://www.npmjs.com/package/json
## yarn global add json

. "$PWD/Build/Gulp/Distribution/Helper/SetColors.sh"
echo "${GREEN}Copy files to root${NC}"

# Copy the defaults (no overwriting)
cp -nv Build/Gulp/Distribution/.gitignore  ./
cp -nv Build/Gulp/package.json ./
cp -nv Build/Gulp/gulp_global.yaml ./
cp -nv Build/Gulp/gulp_local.yaml ./
. "$PWD/Build/Gulp/Distribution/Helper/CopyEssentials.sh"

if which json > /dev/null
  then
    . "$PWD/Build/Gulp/Distribution/Helper/MergePackageJson.sh"
    . "$PWD/Build/Gulp/Distribution/Helper/MergeComposerJson.sh"
  else
    . "$PWD/Build/Gulp/Distribution/Helper/NoJsonInstalled.sh"
fi

exit 0

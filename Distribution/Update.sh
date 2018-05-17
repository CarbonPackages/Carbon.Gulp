#!/bin/bash

## You have to install json if you want to merge .json files
## https://www.npmjs.com/package/json
## yarn global add json

source Build/Gulp/Distribution/Helper/SetColors.sh
echo "${GREEN}Update files on root${NC}"
source Build/Gulp/Distribution/Helper/CopyEssentials.sh
if which json > /dev/null
  then
    source Build/Gulp/Distribution/Helper/MergePackageJson.sh
  else
    source Build/Gulp/Distribution/Helper/NoJsonInstalled.sh
fi

echo $GREEN
echo "Update dependencies"
echo $NC
yarn

exit 0

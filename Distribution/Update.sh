## You have to install json if you want to merge .json files
## https://www.npmjs.com/package/json
## yarn global add json

RED="\033[0;31m"
GREEN="\033[0;32m"
NC="\033[0m" # No Color

echo ""
echo "${GREEN}Update files on root${NC}"
cp Build/Gulp/Distribution/Essentials/.[^.]*  ./

echo ""
if which json > /dev/null
  then
    # merge package.json
    echo "${GREEN}Merge package.json${NC}"
    dependencies=$(cat package.json | json dependencies)
    browserslist=$(cat package.json | json browserslist)
    distribution=$(cat Build/Gulp/Distribution/Default/package.json | json)
    echo "${distribution},{\"browserslist\":$browserslist},{\"dependencies\":$dependencies}" | json --merge > package.json

  else
    echo "If you want to merge json files, you need to install following package globally:"
    echo "${RED}https://www.npmjs.com/package/json${NC}"
    echo "You can install it with this command: ${RED}yarn global add json${NC}"
fi

echo $GREEN
echo "Update dependencies"
echo $NC
yarn

exit 0

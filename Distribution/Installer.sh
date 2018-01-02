## You have to install json if you want to merge .json files
## https://www.npmjs.com/package/json
## yarn global add json

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo ""
echo "${GREEN}Copy files to root${NC}"
cp Build/Gulp/Distribution/Essentials/.[^.]*  ./
#cp Build/Gulp/Distribution/Essentials/*  ./
cp -nv Build/Gulp/Distribution/Hidden/.[^.]*  ./
cp -nv Build/Gulp/Distribution/Defaults/*  ./

echo ""
if which json > /dev/null
  then
    # merge package.json
    echo "${GREEN}Merge json files${NC}"
    echo "- package.json"
    dependencies=$(cat package.json | json dependencies)
    distribution=$(cat Build/Gulp/Distribution/Defaults/package.json | json)
    echo "${distribution},{\"dependencies\":$dependencies}" | json --merge > package.json

    # composer.json
    echo "- composer.json"
    composer=$(cat composer.json)
    replacedComposer=${composer//\\/\\\\}
    scripts=$(cat Build/Gulp/Distribution/Scripts.json)
    echo "${replacedComposer},${scripts}" | json --deep-merge -4 > composer.json
  else
    echo "If you want to merge json files, you need to install following package globally:"
    echo "${RED}https://www.npmjs.com/package/json${NC}"
    echo "You can install it with this command: ${RED}yarn global add json${NC}"
fi

echo $GREEN
echo "Install dependencies"
echo $NC
yarn

exit

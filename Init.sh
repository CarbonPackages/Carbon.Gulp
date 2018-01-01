## You have to install jq if you want to merge the package.json
## https://stedolan.github.io/jq/

RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo "${RED}Copy files to root${NC}"
cp -v Build/Gulp/boilerplate/.[^.]*  ./
cp -vn Build/Gulp/boilerplate/*  ./


echo $RED
echo "Remove node_modules folder"
rm -rf node_modules yarn.lock
echo "Remove yarn.lock"

echo ""
echo "Get dependencies from project"
dependencies=$(jq -r '.dependencies | {dependencies: .}' package.json)

echo "Save content of boilerplate package.json in a variable"
boilerplate=$(jq -r '.' Build/Gulp/boilerplate/package.json)

echo "Merge package.json"
echo $boilerplate $dependencies  | jq -s add > package.json

echo ""
echo "Install dependencies"
echo $NC
yarn

exit 0

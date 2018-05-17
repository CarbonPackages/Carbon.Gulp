composer=$(cat composer.json)
replacedComposer=${composer//\\/\\\\}
composer show neos/neos -q -n > /dev/null 2>&1
if [ $? -eq 0 ]
  then
    version="Neos"
fi
composer show typo3/neos -q -n > /dev/null 2>&1
if [ $? -eq 0 ]
  then
    version="TYPO3"
fi
if [ $version ]
  then
    echo "${GREEN}Merge composer.json${NC}"
    scripts=$(cat Build/Gulp/Distribution/Helper/${version}.json)
    echo "$replacedComposer,$scripts" | json --deep-merge -4 > composer.json
fi

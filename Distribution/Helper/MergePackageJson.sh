_oldVersion="$(cat package.json | json version)"
_newVersion="$(cat Build/Gulp/package.json | json version)"

_isPatchRelease() {
  awk -v u="${_oldVersion}" -v v="${_newVersion}" '
  BEGIN{
    split(u,a,".");
    split(v,b,".");
    for(i=1;i<=2;i++) if(b[i]!=a[i]){print "false";exit}
    print "true"
  }'
}

_isSameRelease() {
  awk -v u=${_oldVersion} -v v=${_newVersion} '
  BEGIN{
    split(u,a,".");
    split(v,b,".");
    for(i=1;i<=3;i++) if(b[i]!=a[i]){print "false";exit}
    print "true"
  }'
}

echo "${GREEN}package.json${NC}"

if [ "$(_isSameRelease)" = "true" ]
  then
    echo "No merge necessary. Version ${GREEN}${_oldVersion}${NC}"
  else
    _version="{\"version\": \"$(cat Build/Gulp/package.json | json version)\"}"
    _babel="{\"babel\": $(cat Build/Gulp/package.json | json babel)}"
    _prettier="{\"prettier\": $(cat Build/Gulp/package.json | json prettier)}"
    _scripts="{\"scripts\": $(cat Build/Gulp/package.json | json scripts)}"
    _devDependencies="{\"devDependencies\": $(cat Build/Gulp/package.json | json devDependencies)}"

    package=$(cat package.json | json)

    if [ "$(_isPatchRelease)" = "true" ]
      then
        echo "Merge from ${GREEN}${_oldVersion}${NC} to ${GREEN}${_newVersion}${NC}"
        echo
        echo "${RED}Important:${NC} If you problems with your installation, please delete ${GREEN}node_modules${NC} and ${GREEN}yarn.lock${NC} and try it again"
      else
        echo "Major/minor merge from ${RED}${_oldVersion}${NC} to ${RED}${_newVersion}${NC}"
        echo "${RED}Deleting${NC} node_modules and yarn.lock"
        rm -rf node_modules yarn.lock
    fi
    echo $package,$_version,$_babel,$_prettier,$_scripts,$_devDependencies | json --merge > package.json
fi
echo

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

if [ "$(_isSameRelease)" = "true" ]
  then
    echo "${GREEN}package.json${NC}"
    echo "No merge necessary. Version ${GREEN}${_oldVersion}${NC}"
  else
    echo "${GREEN}Update files on root${NC}"
    . "$PWD/Build/Gulp/Distribution/Helper/CopyFiles.sh"
    echo "${GREEN}package.json${NC}"
    _version="{\"version\": \"$(cat Build/Gulp/package.json | json version)\"}"
    _babel="{\"babel\": $(cat Build/Gulp/package.json | json babel)}"
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
        echo "Please enter ${RED}nvm use${NC} to ensure the right node version"
        rm -rf node_modules yarn.lock
    fi

    # Merge babel only if it is here
    if [ "$(cat package.json | json babel)" ]
      then
        echo $package,$_version,$_babel,$_scripts,$_devDependencies | json --merge > package.json
      else
        echo $package,$_version,$_scripts,$_devDependencies | json --merge > package.json
    fi
fi
echo

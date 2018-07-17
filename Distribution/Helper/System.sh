if ! which node > /dev/null
  then
    echo
    echo "${RED}Please install node:${NC} https://nodejs.org"
    echo
fi

if ! which yarn > /dev/null
  then
    echo
    echo "${RED}Please install yarn:${NC} https://yarnpkg.com"
    echo
fi

if which nvm > /dev/null
  then
    nvm use
  else
    echo
    echo "${RED}It is recommend to use nvm:${NC} https://github.com/creationix/nvm"
    echo
fi

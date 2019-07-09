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

_noNvm() {
  echo
  echo "${RED}It is recommend to use nvm:${NC} https://github.com/creationix/nvm"
  echo
}

if [ -f ~/.nvm/nvm.sh ]
  then
    if [ -f ~/.bashrc ]
      then
        . ~/.bashrc
    fi
    . ~/.nvm/nvm.sh
    if [ "$(command -v nvm | tr -d '\n')" = "nvm" ]
      then
        nvm use >/dev/null
      else
        _noNvm
    fi
  else
    _noNvm
fi

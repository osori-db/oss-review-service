#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && . "/opt/homebrew/opt/nvm/nvm.sh"
nvm use 20 > /dev/null 2>&1
cd /Users/sean/osori_review
npm run dev

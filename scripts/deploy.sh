#!/bin/bash

set -e

git diff-index --quiet HEAD -- || (echo 'Please commit all changes before deploying.'; exit 1)
git subtree split --prefix build -b master
git push -f origin master:master

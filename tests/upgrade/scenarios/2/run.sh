#!/bin/sh

rm -rf project
cp -r given project

cd project
ldm="../../../../../bin/cli.js"
env="../../../../../.env"

source $env
GITHUB_TOKEN="$GITHUB_TOKEN" $ldm upgrade reset.css --force

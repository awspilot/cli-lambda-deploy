#!/bin/bash
cd $AWSPILOT_DOCKER_WORKDIR;
. ~/.bash_profile
node --version
lambda start $AWSPILOT_LAMBDA_CONFIG

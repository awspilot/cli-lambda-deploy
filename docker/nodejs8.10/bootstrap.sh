#!/bin/bash
cd $AWSPILOT_WORKDIR;
. ~/.bash_profile
lambda start $AWSPILOT_LAMBDA_CONFIG

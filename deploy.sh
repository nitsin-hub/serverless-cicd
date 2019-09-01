#! /bin/bash

# [TESTING]
#env="dev"

# Deploy serverless backend
serverless deploy --stage $env --package $CODEBUILD_SRC_DIR/target/$env -v -r us-east-1

# Gather service endpoint from cloud formation output
serviceEndpoint=$( aws cloudformation describe-stacks --stack-name chaos-button-app-$env --query "Stacks[0].Outputs[?OutputKey=='ServiceEndpoint'].{ServiceEndpoint:OutputValue}" --output text )

# Generate env config file for our frontend
echo " 
// Environment configuration for $env
const API_ENDPOINT = \"$serviceEndpoint\";
" > ./client/dist/config.js

# Deploy frontend
serverless client deploy --no-confirm --stage $env
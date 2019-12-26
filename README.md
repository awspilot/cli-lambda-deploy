

# cli-lambda-deploy
Command line tool deploy code to [AWS Lambda](http://aws.amazon.com/lambda/).  

[![Build Status](https://travis-ci.org/awspilot/cli-lambda-deploy.svg?branch=master)](https://travis-ci.org/awspilot/cli-lambda-deploy)
[![Downloads](https://img.shields.io/npm/dm/aws-lambda?maxAge=2592000)](https://www.npmjs.com/package/aws-lambda)
[![Downloads](https://img.shields.io/npm/dy/aws-lambda?maxAge=2592000)](https://www.npmjs.com/package/aws-lambda)
[![Downloads](https://img.shields.io/npm/dt/aws-lambda?maxAge=2592000)](https://www.npmjs.com/package/aws-lambda)


## Installation

```
npm install -g aws-lambda
```

WARN: upgrading to v1.0.0 will remove your function environment and layers if they are not defined in the config file  


## Usage

```
// if installed globally then
lambda deploy /path/to/my-function.lambda

// if 'npm installed' without the -g then you must use the full path
node_modules/.bin/lambda /path/to/my-function.lambda
```

## Sample .lambda file

 * PATH must point to your code folder and is relative to the .lambda file  
 * PATH can be relative or absolute  
 * If not set, Runtime defaults to **nodejs10.x**  
 * If not set, FunctionName defaults to the name of the config file without extension ("my-function" in this case)  
 * You can use **Ref** to reference environment variables in the form of env.YOUR_ENVIRONMENT_NAME  
 * `lambda deploy <file.lambda>` credentials needs permissions to **CreateFunction**, **UpdateFunctionConfiguration** and **UpdateFunctionCode**  
 * `lambda delete <file.lambda>` credentials needs permissions to **DeleteFunction**  
 * `lambda invoke <file.lambda>` credentials needs permissions to **InvokeFunction**  


```
// Sample contents of my-function.lambda
{
	"PATH": "./test-function",
	"AWS_KEY": { "Ref" : "env.AWS_ACCESS_KEY_ID" },,
	"AWS_SECRET": { "Ref" : "env.AWS_SECRET_ACCESS_KEY"},
	"AWS_REGION": "us-east-1",

	"FunctionName": "test-lambda",
	"Role": "your_amazon_role",
	"Runtime": "nodejs10.x",
	"Handler": "index.handler",
	"MemorySize": "128",
	"Timeout": "3",
	"Environment": {
		"Variables": {
			"Hello": "World",
		}
	},
	"Layers": [
		"arn:aws:lambda:eu-central-1:452980636694:layer:awspilot-dynamodb-2_0_0-beta:1"
	],
	"Tags": {
		"k1": "v1",
		"k2": "v2"
	},
	"Description": ""
}
```

You can also use yaml content,
```
# unlike json, comments are allowed in yaml, yey!
# remember to use spaces not tabs 😞
PATH: ./new-function
AWS_KEY:  !Ref "env.lambda_deploy_aws_key"
AWS_SECRET: !Ref "env.lambda_deploy_aws_secret"
AWS_REGION: "eu-central-1"

FunctionName: new-function-v12
Role: "arn:aws:iam::452980636694:role/CliLambdaDeploy-TestRole-1H89NZ845HHBK"
Runtime: "nodejs8.10"
Handler: "index.handler"
MemorySize: "128"
Timeout: "3"
Environment:
    Variables:
        Hello: "World"
Layers:
    - "arn:aws:lambda:eu-central-1:452980636694:layer:awspilot-dynamodb-2_0_0-beta:1"
Tags:
    k1: v1
    k2: v2
Description: ""
```



# cli-lambda-deploy
Command line tool deploy code to [AWS Lambda](http://aws.amazon.com/lambda/).  

[![Downloads](https://img.shields.io/npm/dm/aws-lambda?maxAge=2592000)](https://www.npmjs.com/package/aws-lambda)
[![Downloads](https://img.shields.io/npm/dy/aws-lambda?maxAge=2592000)](https://www.npmjs.com/package/aws-lambda)
[![Downloads](https://img.shields.io/npm/dt/aws-lambda?maxAge=2592000)](https://www.npmjs.com/package/aws-lambda)


## Installation

```
npm install -g aws-lambda
```

## Usage

```
// if installed globally then
lambda deploy /path/to/my-function.lambda

// if 'npm installed' without the -g then you must use the full path
node_modules/.bin/lambda /path/to/my-function.lambda
```

## Configuration File

```
// PATH must point to your code folder and is relative to the .lambda file
// PATH can be relative or absolute
// If not set, Runtime defaults to "nodejs"
// Possible Runtime values:
//		nodejs8.10 | nodejs10.x | nodejs12.x
//		java8 | java11
//		python2.7 | python3.6 | python3.7 | python3.8
//		dotnetcore1.0 | dotnetcore2.0 | dotnetcore2.1
//		go1.x
//		ruby2.5
//		provided
// If not set, FunctionName defaults to the name of the config file without extension ("my-function" in this case)

// Sample contents of my-function.lambda

{
	"PATH": "./test-function",
	"AWS_KEY": "your_key",
	"AWS_SECRET": "your_secret",
	"AWS_REGION": "us-east-1",

	"FunctionName": "test-lambda",
	"Role": "your_amazon_role",
	"Runtime": "nodejs10.x",
	"Handler": "index.handler",
	"MemorySize": "128",
	"Timeout": "3",
	"Description": ""
}
```

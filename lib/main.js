"use strict";

var exec = require( "child_process" ).exec
var fs = require( "fs" )
var os = require( "os" )
var path = require( "path" )
var yaml = require('js-yaml')
var buildYamlSchema = require('./schema')

var Lambda = function( ) {
	return this;
}

Lambda.prototype.deploy = function( program ) {
	var aws = require( "aws-sdk" )

	if (program.substr(-7) === '.lambda')
		program = program.substr(0,program.length - 7)

	var config_file = program + '.lambda'
	if ( !fs.existsSync( config_file ) ) {
		console.log('Lambda config not found (' + program + '.lambda )')
		process.exit(-1)
	}

	try {
		//var $config = JSON.parse(fs.readFileSync( config_file, "utf8"))
		var $config = yaml.safeLoad(fs.readFileSync( config_file, "utf8"), {
			schema: buildYamlSchema(),
			onWarning: function(warning) {
				console.error(warning);
			},
			json: true,
		})
	} catch (e) {
		console.log('Invalid config file (' + program + '.lambda )', e )
		process.exit(-1)
	}
	// console.log( JSON.stringify($config, null, "\t"))
	if ((typeof $config.AWS_KEY === "object") && $config.AWS_KEY.hasOwnProperty('Ref') &&  (typeof $config.AWS_KEY.Ref === "string") && ($config.AWS_KEY.Ref.indexOf('env.') === 0))
		$config.AWS_KEY = process.env[ $config.AWS_KEY.Ref.split('env.')[1] ]

	if ((typeof $config.AWS_SECRET === "object") && $config.AWS_SECRET.hasOwnProperty('Ref') &&  (typeof $config.AWS_SECRET.Ref === "string") && ($config.AWS_SECRET.Ref.indexOf('env.') === 0))
		$config.AWS_SECRET = process.env[ $config.AWS_SECRET.Ref.split('env.')[1] ]


	if ((typeof $config.Role === "object") && $config.Role.hasOwnProperty('Ref') &&  (typeof $config.Role.Ref === "string") && ($config.Role.Ref.indexOf('env.') === 0))
		$config.Role = process.env[ $config.Role.Ref.split('env.')[1] ]


	aws.config.update({
		accessKeyId: $config.AWS_KEY,
		secretAccessKey: $config.AWS_SECRET,
		region: $config.AWS_REGION
	})
	var lambda = new aws.Lambda( { apiVersion: "2014-11-11" } )
	var lambdaV2 = new aws.Lambda( { apiVersion: "2015-03-31" } )

	if (!$config.FunctionName)
		$config.FunctionName = program.split('/').slice(-1)[0]

	var _this = this

	var tmpfile = path.join( os.tmpdir(), $config.FunctionName + "-" + new Date().getTime() + ".zip" )
	var $configPath = program.split('/').slice(0,-1).join('/')
	//console.log( $configPath )

	if (($config.PATH.substr(0,1) === '/') || ($config.PATH.substr(0,2) == '~/')) {
		var $fullFunctionPath =  ($config.PATH).replace(/\/\.\//g, '\/')
	} else {
		var $fullFunctionPath = (process.cwd() + '/' + $configPath + '/' + $config.PATH).replace(/\/\.\//g, '\/')
	}

	if ($fullFunctionPath.substr(-1) !== '/')
		$fullFunctionPath+='/'

	if (!fs.existsSync($fullFunctionPath)) {
		console.log( "No such directory:" + $fullFunctionPath )
		process.exit(-1)
	}

	var $cwd = process.cwd()
	process.chdir($fullFunctionPath)

	var zipfileList = '.'

	try {
		var packageJson = fs.readFileSync( 'package.json', 'utf8' )

		if ( packageJson ) {
			var packageJsonFiles = JSON.parse( packageJson ).files

			if ( typeof packageJsonFiles === 'object' ) {
				var zipfileList = packageJsonFiles.join( ' ' )
			}
		}
	} catch (e) { }

	var $zipCmd = "zip -r -9  " + tmpfile + ' ' + zipfileList

	exec( $zipCmd, { maxBuffer: 1024 * 1024 } ,function( err, stdout, stderr ) {
		process.chdir($cwd)
		if ( err ) {
			console.log("Error generating zip file")
			throw err;
		}
		var buffer = fs.readFileSync( tmpfile )

		// var params = {
		// 	FunctionName: $config.FunctionName,
		// 	FunctionZip: buffer,
		// 	Handler: $config.Handler,
		// 	Mode: 'event',
		// 	Role: $config.Role,
		// 	Runtime: $config.Runtime || 'nodejs10.x',
		// 	Description: $config.Description,
		// 	MemorySize: $config.MemorySize,
		// 	Timeout: $config.Timeout
		// }

		if (typeof $config.Environment !== "object")
			$config.Environment = {}

		if (typeof $config.Environment.Variables !== "object")
			$config.Environment.Variables = {}

		if (typeof $config.Tags !== "object")
			$config.Tags = {}

		var paramsV2 = {
			Code: { ZipFile: buffer, },
			Description: $config.Description,
			FunctionName: $config.FunctionName,
			Handler: $config.Handler,
			MemorySize: $config.MemorySize,
			Publish: true,
			Role: $config.Role,
			Runtime: $config.Runtime || 'nodejs10.x',
			Timeout: $config.Timeout,
			Environment: $config.Environment,
			Layers: $config.Layers || [],
			Tags: $config.Tags,
			//VpcConfig: {}
		};

		// remove temp file
		fs.unlinkSync( tmpfile )

		lambdaV2.createFunction( paramsV2, function( err, data ) {
			if ( err && err.code !== 'ResourceConflictException') {
				console.log("upload error:", err )
				process.exit(-1)
			}

			if ( err && err.code === 'ResourceConflictException') {

				// console.log("function exists, should update config and code")
				var paramsV2 = {
					Description: $config.Description,
					FunctionName: $config.FunctionName,
					Handler: $config.Handler,
					MemorySize: $config.MemorySize,
					Role: $config.Role,
					Runtime: $config.Runtime || 'nodejs10.x',
					Timeout: $config.Timeout,
					Environment: $config.Environment,
					Layers: $config.Layers || [],
					//Tags: $config.Tags,
					//VpcConfig: {}
				};

				// interesting: tags not supported by updateFunctionConfiguration but it will remve tags
				lambdaV2.updateFunctionConfiguration(paramsV2, function(err, data) {
					if ( err) {
						console.log("upload error:", err )
						process.exit(-1)
					}

					var paramsV2 = {
						FunctionName: $config.FunctionName,
						//DryRun: true || false,
						Publish: true,
						// RevisionId: 'STRING_VALUE',
						ZipFile: buffer,
					};
					lambdaV2.updateFunctionCode(paramsV2, function(err, data2) {
						if ( err) {
							console.log("upload error:", err )
							process.exit(-1)
						}

						// lambdaV2.listTags({ Resource: data.FunctionArn }, function(err, data) {
						// 	console.log( err, data )
						// });

						// lambdaV2.listTags({ Resource: data.FunctionArn }, function(err, data) {
						// 	console.log( err, data )
						// });

						if (Object.keys($config.Tags).length) {
							lambdaV2.tagResource({ Resource: data.FunctionArn, Tags: $config.Tags }, function(err, data) {
								if (err) console.log("WARNING: tagResource failed on function ", $config.FunctionName )
								console.log( "Deployed!" );
							});

							return;
						}

						// @todo: listTags, diff with $config.Tags, untagResource not in $config.Tags, tagResource with $config.Tags
						console.log( "Deployed!" );
						return;
					});


				})
				return;
			}
			console.log( "Deployed!" );
		});


		// lambda.uploadFunction( params, function( err, data ) {
		// 	if ( err ) {
		// 		console.log("upload error:", err )
		// 		process.exit(-1)
		// 	}
		//
		// 	console.log( "Deployed!" );
		// });

	} );
}

Lambda.prototype.delete = function( program ) {
	var aws = require( "aws-sdk" )

	if (program.substr(-7) === '.lambda')
		program = program.substr(0,program.length - 7)

	var config_file = program + '.lambda'
	if ( !fs.existsSync( config_file ) ) {
		console.log('Lambda config not found (' + program + '.lambda )')
		process.exit(-1)
	}

	try {
		//var $config = JSON.parse(fs.readFileSync( config_file, "utf8"))
		var $config = yaml.safeLoad(fs.readFileSync( config_file, "utf8"), {
			schema: buildYamlSchema(),
			onWarning: function(warning) {
				console.error(warning);
			},
			json: true,
		})
	} catch (e) {
		console.log('Invalid config file (' + program + '.lambda )', e )
		process.exit(-1)
	}

	if ((typeof $config.AWS_KEY === "object") && $config.AWS_KEY.hasOwnProperty('Ref') &&  (typeof $config.AWS_KEY.Ref === "string") && ($config.AWS_KEY.Ref.indexOf('env.') === 0))
		$config.AWS_KEY = process.env[ $config.AWS_KEY.Ref.split('env.')[1] ]

	if ((typeof $config.AWS_SECRET === "object") && $config.AWS_SECRET.hasOwnProperty('Ref') &&  (typeof $config.AWS_SECRET.Ref === "string") && ($config.AWS_SECRET.Ref.indexOf('env.') === 0))
		$config.AWS_SECRET = process.env[ $config.AWS_SECRET.Ref.split('env.')[1] ]


	if ((typeof $config.Role === "object") && $config.Role.hasOwnProperty('Ref') &&  (typeof $config.Role.Ref === "string") && ($config.Role.Ref.indexOf('env.') === 0))
		$config.Role = process.env[ $config.Role.Ref.split('env.')[1] ]


	aws.config.update({
		accessKeyId: $config.AWS_KEY,
		secretAccessKey: $config.AWS_SECRET,
		region: $config.AWS_REGION
	})

	if (!$config.FunctionName)
		$config.FunctionName = program.split('/').slice(-1)[0]

	var lambdaV2 = new aws.Lambda( { apiVersion: "2015-03-31" } )


	lambdaV2.deleteFunction({ FunctionName: $config.FunctionName }, function(err, data) {
		if ( err && err.code !== 'ResourceNotFoundException') {
			console.log("delete error:", err )
			process.exit(-1)
		}

		if ( err &&  err.code === 'ResourceNotFoundException')
			console.log("WARNING: deleteFunction ",$config.FunctionName,": ResourceNotFoundException " )
		else
			console.log( "Deleted!" );
	});
}


Lambda.prototype.invoke = function( program ) {
	var aws = require( "aws-sdk" )

	if (program.substr(-7) === '.lambda')
		program = program.substr(0,program.length - 7)

	var config_file = program + '.lambda'
	if ( !fs.existsSync( config_file ) ) {
		console.log('Lambda config not found (' + program + '.lambda )')
		process.exit(-1)
	}

	try {
		//var $config = JSON.parse(fs.readFileSync( config_file, "utf8"))
		var $config = yaml.safeLoad(fs.readFileSync( config_file, "utf8"), {
			schema: buildYamlSchema(),
			onWarning: function(warning) {
				console.error(warning);
			},
			json: true,
		})
	} catch (e) {
		console.log('Invalid config file (' + program + '.lambda )', e )
		process.exit(-1)
	}

	if ((typeof $config.AWS_KEY === "object") && $config.AWS_KEY.hasOwnProperty('Ref') &&  (typeof $config.AWS_KEY.Ref === "string") && ($config.AWS_KEY.Ref.indexOf('env.') === 0))
		$config.AWS_KEY = process.env[ $config.AWS_KEY.Ref.split('env.')[1] ]

	if ((typeof $config.AWS_SECRET === "object") && $config.AWS_SECRET.hasOwnProperty('Ref') &&  (typeof $config.AWS_SECRET.Ref === "string") && ($config.AWS_SECRET.Ref.indexOf('env.') === 0))
		$config.AWS_SECRET = process.env[ $config.AWS_SECRET.Ref.split('env.')[1] ]


	if ((typeof $config.Role === "object") && $config.Role.hasOwnProperty('Ref') &&  (typeof $config.Role.Ref === "string") && ($config.Role.Ref.indexOf('env.') === 0))
		$config.Role = process.env[ $config.Role.Ref.split('env.')[1] ]


	aws.config.update({
		accessKeyId: $config.AWS_KEY,
		secretAccessKey: $config.AWS_SECRET,
		region: $config.AWS_REGION
	})

	if (!$config.FunctionName)
		$config.FunctionName = program.split('/').slice(-1)[0]


	var lambdaV2 = new aws.Lambda( { apiVersion: "2015-03-31" } )


	var paramsV2 = {
		FunctionName: $config.FunctionName,
		//ClientContext: 'STRING_VALUE',
		InvocationType:'RequestResponse',
		LogType: 'Tail',
		Payload: JSON.stringify({}),
	};
	lambdaV2.invoke(paramsV2, function(err, data) {
		if ( err ) {
			console.log("invoke error:", err )
			process.exit(-1)
		}
		try {
			console.log(JSON.stringify(JSON.parse(data.Payload), null, "\t"))
		} catch(e) {}
		console.log("------------")
		console.log( Buffer.from( data.LogResult, 'base64').toString() )
	});
}


module.exports = new Lambda( );

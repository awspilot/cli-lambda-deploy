
exec = function( cmd, params, cb ) {
	var spawn = require('child_process').spawn;
	var prc = spawn( cmd,  params );

	prc.stdout.setEncoding('utf8');
	prc.stdout.on('data', function (data) {
		console.log(data.toString())
	});
	prc.stderr.on('data', function (data) {
		console.log(data.toString())
	});
	prc.on('close', function (code) {
		if (code !== 0 )
			return cb({ code: code })

		cb()
	});
}

require("./tests/000-new-function-json")

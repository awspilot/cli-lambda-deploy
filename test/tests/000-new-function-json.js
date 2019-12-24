
describe('lambda deploy new-function', function () {
	it('log', function(done) {
		//console.log(process.env)

		var spawn = require('child_process').spawn;
		var prc = spawn('node',  ['./bin/lambda', 'deploy', './test/res/new-function.lambda']);

		prc.stdout.setEncoding('utf8');
		prc.stdout.on('data', function (data) {
			console.log(data.toString())
		});
		prc.stderr.on('data', function (data) {
			console.log(data.toString())
		});
		prc.on('close', function (code) {
			if (code !== 0 )
				throw 'process exit code ' + code;
			done()
		});
	})
})

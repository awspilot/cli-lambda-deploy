
describe('lambda deploy new-function', function () {
	it('log', function(done) {
		//console.log(process.env)

		exec( 'node', ['./bin/lambda', 'deploy', './test/res/new-function.lambda'] , function( err, data ) {
			if (err)
				throw 'process exit code ' + code.code;

			done()
		})

	})
})

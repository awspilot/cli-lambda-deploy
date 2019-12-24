
describe('lambda deploy new-function', function () {


	it('delete non existing function', function(done) {
		exec( 'node', ['./bin/lambda', 'delete', './test/res/new-function.lambda'] , function( err, data ) {
			if (err)
				throw 'process exit code ' + err.code;

			done()
		})
	})

	it('create new-function', function(done) {
		exec( 'node', ['./bin/lambda', 'deploy', './test/res/new-function.lambda'] , function( err, data ) {
			if (err)
				throw 'process exit code ' + err.code;

			done()
		})
	})

	it('create(existing) new-function', function(done) {
		exec( 'node', ['./bin/lambda', 'deploy', './test/res/new-function.lambda'] , function( err, data ) {
			if (err)
				throw 'process exit code ' + err.code;

			done()
		})
	})

	it('delete new-function', function(done) {
		exec( 'node', ['./bin/lambda', 'delete', './test/res/new-function.lambda'] , function( err, data ) {
			if (err)
				throw 'process exit code ' + err.code;

			done()
		})
	})


})

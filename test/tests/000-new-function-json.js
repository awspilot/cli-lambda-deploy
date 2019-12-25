
describe('new-function JSON config', function () {


	it('delete non existing function', function(done) {
		exec( 'node', ['./bin/lambda', 'delete', './test/res/new-function-json-' + process.version.split('.')[0] + '.lambda'] , function( err, data ) {
			if (err)
				throw 'process exit code ' + err.code;

			done()
		})
	})

	it('create new-function', function(done) {
		exec( 'node', ['./bin/lambda', 'deploy', './test/res/new-function-json-' + process.version.split('.')[0] + '.lambda'] , function( err, data ) {
			if (err)
				throw 'process exit code ' + err.code;

			done()
		})
	})

	it('create(existing) new-function', function(done) {
		exec( 'node', ['./bin/lambda', 'deploy', './test/res/new-function-json-' + process.version.split('.')[0] + '.lambda'] , function( err, data ) {
			if (err)
				throw 'process exit code ' + err.code;

			done()
		})
	})

	it('invoke new-function', function(done) {
		exec( 'node', ['./bin/lambda', 'invoke', './test/res/new-function-json-' + process.version.split('.')[0] + '.lambda'] , function( err, data ) {
			if (err)
				throw 'process exit code ' + err.code;

			done()
		})
	})

	it('delete new-function', function(done) {
		exec( 'node', ['./bin/lambda', 'delete', './test/res/new-function-json-' + process.version.split('.')[0] + '.lambda'] , function( err, data ) {
			if (err)
				throw 'process exit code ' + err.code;

			done()
		})
	})


})

exports.handler = function( event, context, cb ) {
	var out = {
		version: process.version,
		event: event,
		environment: process.env,
	}

	console.log(JSON.stringify(out, null, "\t"))
	context.done( null, out )
}

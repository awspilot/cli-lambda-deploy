exports.handler = function( event, context, cb ) {
	var clean_env = JSON.parse(JSON.stringify(process.env))
	delete clean_env.AWS_ACCESS_KEY_ID;
	delete clean_env.AWS_SECRET_ACCESS_KEY;
	delete clean_env.AWS_SESSION_TOKEN;

	var out = {
		version: process.version,
		event: event,
		environment: clean_env,
	}

	console.log(JSON.stringify(out, null, "\t"))
	context.done( null, out )
}

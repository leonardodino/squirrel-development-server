var express = require('express')
var server  = require('./middleware')
var app     = express()

var LOGGING = true
var RELEASES_DIR = __dirname + '/releases'
var PORT = 6363

app
	.use(server({
		log: LOGGING,
		releasesPath: RELEASES_DIR,
		localPort: PORT,
	}))
	.listen(PORT, function(){
		console.log('server listening on port', PORT)
	})

var Versions = require('./lib/versions')

var releases = Versions('/static/', __dirname+'/releases')

// releases.listAvailable({platform: 'darwin'}, function(err, versions){
// 	if(err){return console.error(err)}
// 	console.log(versions)
// })
releases.getUpdate({platform: 'darwin', version: '0.0.2'}, function(err, versions){
	if(err){return console.error(err)}
	console.log(versions)
})

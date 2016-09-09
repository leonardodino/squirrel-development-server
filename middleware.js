var express = require('express')
var Versions = require('./lib/versions')
var morgan  = require('morgan')
var router  = express.Router()

function validateMiddlewareOptions(options){
	if(!options.address && !options.localPort){
		throw new Error('must define options.address or options.localPort')
	}
	if(!options.releasesPath){
		throw new Error('must define options.releasesPath')
	}
}

module.exports = function(options){
	validateMiddlewareOptions(options)
	var staticBaseUrl = options.staticBaseUrl || '/static'
	var releasesPath  = options.releasesPath
	var log           = options.log
	var address       = options.address || 'http://localhost:' + options.localPort
	var urlPrefix     = address+staticBaseUrl + '/'

	var releases      = Versions(urlPrefix, releasesPath)

	if(log){
		router.use(morgan('dev'))
	}

	return router
		.use(staticBaseUrl, express.static(releasesPath))
		.get('/update/darwin/:version', function(req, res, next){

			var updateOptions = {
				platform: 'darwin',
				version: req.params['version'],
			}

			releases.getUpdate(updateOptions, function(err, update){
				if(err){
					return next(err)
				}
				if(update){
					res.json(update)
				}else{
					res.status(204).send()
				}
			})
		})
		.all('*', function(req, res){
			res
				.status(404)
				.json({	
					code: 404,
					errors: [{
						domain: 'global',
						reason: 'notFound',
						message: 'Not Found'
					}]
				})
		})
		.use(function(err, req, res, next){
			if(log){
				console.error('------')
				console.error(err.message)
				console.error('---')
				console.error(err.stack)
				console.error('------')
			}

			res
				.status(500)
				.json({
					code: 500,
					errors:[{
						domain: 'global',
						reason: 'serverError',
						message: err.message,
					}]
				})
		})
}

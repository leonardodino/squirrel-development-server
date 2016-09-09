var path     = require('path')
var fs       = require('fs')
var semver   = require('semver')
var async    = require('async')
var Platform = require('./platform')

function sortedSemverList(array){
	return array.filter(semver.valid).sort(semver.rcompare)
}

function readVersionDirFiles(baseDir){
	return function(versionName, callback){
		var versionDir = path.join(baseDir, versionName)
		fs.readdir(versionDir, function(err, files){
			if(err){return callback(err)}
			callback(null, {
				version: versionName,
				files: files,
			})
		})
	}
}

function sendUpdateObject(info, callback){
	var platform = null
	var directory = this.directory
	var urlPrefix = info.urlPrefix
	var version = info.version

	try{
		platform = Platform(info.platform)
	}catch(e){
		return callback(e)
	}

	platform.getVersionFiles(info.files, function(err, versionFiles) {
		if(err){return callback(err)}

		var updateFile = versionFiles.update
		var updateSlug = version + '/' + updateFile

		if(!updateFile){
			return callback(new Error('Update File missing'))
		}

		callback(null, {
			name: version,
			notes: 'release notes',
			url: urlPrefix + updateSlug,
		})
	})
}

function Versions(urlPrefix, baseDir){
	if(!(this instanceof Versions)){
		return new Versions(urlPrefix, baseDir)
	}

	this.urlPrefix = urlPrefix || '/'
	this.directory = baseDir
}

// sorted versions, version[0] is the newest
Versions.prototype.list = function listVersions(options, callback){
	fs.readdir(this.directory, function(err, files){
		if(err){return callback(err)}

		var versions = sortedSemverList(files)
		callback(null, versions)
	})
}

// sorted versions available to a platform
Versions.prototype.listAvailable = function listAvailableVersions(options, callback){
	var platform = null
	var directory = this.directory

	try{
		platform = Platform(options.platform)
	}catch(e){
		return callback(e)
	}

	this.list({}, function(err, versions){
		if(err){return callback(err)}
		async.map(versions, readVersionDirFiles(directory), function(err, versions){
			if(err){return callback(err)}
			async.filter(versions, platform.supportedVersion.bind(platform), function(err, supportedVersions){
				if(err){return callback(err)}
				if(options.object){
					// return [{version, files}]
					callback(null, supportedVersions)
				}else{
					// return ['version']
					async.map(supportedVersions, (o, callback)=>callback(null, o.version), callback)
				}
			})
		})
	})
}

// returns a release object or false
Versions.prototype.getUpdate = function checkForNewVersions(options, callback){
	var clientPlatform = options.platform
	var clientVersion = options.version
	var urlPrefix = this.urlPrefix
	var directory = this.directory
	// [TODO]: handle input errors

	var LAOptions = {
		platform: clientPlatform,
		object: true,
	}

	this.listAvailable(LAOptions, function(err, versions){
		if(err){return callback(err)}

		if(!versions || !versions.length){
			return callback(null, false)
		}

		var latestVersion = versions[0].version
		var clientIsOutdated = semver.gt(latestVersion, clientVersion)

		if(clientIsOutdated){
			sendUpdateObject({
				platform: clientPlatform,
				version: latestVersion,
				urlPrefix: urlPrefix,
				files: versions[0].files,
			}, callback)
		}else{
			callback(null, false)
		}
	})
}

module.exports = Versions

var path = require('path')

var PLATFORMS = {
	win32: 'win32',
	darwin: 'darwin',
}

function filterWindowsFiles(filenames){
	var files = filenames.reduce(function(fileTypes, filename){
		if(filename === 'RELEASES'){
			fileTypes.releases = filename
		}
		if(path.extname(filename) === '.nupkg' && filename.indexOf('-full') > -1){
			fileTypes.nupkg = filename
			fileTypes.update = filename
		}
	}, {releases: false, nupkg: false})

	return !!(files.releases && files.nupkg) && files
}

function filterMacFiles(filenames){
	var zip = filenames.find(function(filename){
		return path.extname(filename) === '.zip' && filename.indexOf('-darwin') > -1
	})
	return !!zip && {zip: zip, update: zip}
}

function filterFilenamesByPlatform(filenames, platform){
	var fn = {}
	fn[PLATFORMS['win32']] = filterWindowsFiles
	fn[PLATFORMS['darwin']] = filterMacFiles
	return fn[platform] && fn[platform](filenames)
}

function Platform(platform_name){
	if(!(this instanceof Platform)){
		return new Platform(platform_name)
	}

	this.platform = PLATFORMS[platform_name]
	if(!this.platform){
		throw new Error('Platform Error: unsuported platform: ' + platform_name)
	}

	return this
}

Platform.prototype.getVersionFiles = function getVersionFiles(filenames, callback){
	var versionFiles = filterFilenamesByPlatform(filenames, this.platform)
	callback(null, versionFiles)
}
Platform.prototype.supportedVersion = function supportedVersion(versionObject, callback){
	var filenames = versionObject.files
	var versionFiles = this.getVersionFiles(filenames, callback)
}

module.exports = Platform;

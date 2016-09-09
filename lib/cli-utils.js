var os      = require('os')
var fs      = require('fs')
var path    = require('path')

function formatColumn(num){
	return function(str){
		return str + ':' +(' ').repeat(num - (str.length))
	}
}

function printSettings(settings){
	var keyWidth = settings.reduce(function(maxWidth, setting){
		return Math.max(maxWidth, setting[0].length)
	}, 0)
	var keyColumn = formatColumn(keyWidth)
	settings.forEach(function(setting){
		console.log('', keyColumn(setting[0]), setting[1])
	})
}

function resolvePath(directory){
	return directory && fs.realpathSync(directory)
}

function getRelativePath(directory){
	return path.join('~', path.relative(os.homedir(), directory))
}

function printCli(app, settings){
	var title = '--- ' + app.name + ' - v' + app.version + ' ---'
	console.log('')
	console.log(title)
	printSettings(settings)
	console.log('-'.repeat(title.length))
	console.log('')
}

module.exports = {
	resolvePath: resolvePath,
	getRelativePath: getRelativePath,
	printCli: printCli,
}

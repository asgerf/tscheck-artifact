#!/usr/bin/env node
var fs = require('fs');
var program = require('commander')
require('sugar')
var assert = require('assert')

program
	.option('--latex', 'Print as LaTeX table columns')
	.parse(process.argv);

var files = program.args;
var inputs = files.map(function(file) {
	return {
		file: file,
		lines: fs.readFileSync(file, 'utf8').split(/\n\r?|\r/).exclude('')
	}
})

var dumpFn;
if (program.latex) {
	dumpFn = function(arr) {
		return arr.join(' & ') + ' \\\\';
	}
} else {
	dumpFn = function(arr) {
		return arr.join(' ');
	}
}


var sum = []
function collect(arr) {
	for (var i=0; i<arr.length; i++) {
		sum[i] = (sum[i] || 0) + arr[i];
	}
}
function output(name, arr) {
	console.log(name.padRight(30) + ' ' + dumpFn(arr))
}
function report(name, arr) {
	output(name, arr)
	collect(arr)
}

inputs.forEach(function(input) {
	var impl = input.lines.count(/\[IMPL\]/)
	
	var init = input.lines.count(/\[INIT\]/)
	var platform = input.lines.count(/\[PLATFORM\]/)
	var snapshot = init + platform;

	var interfaceLines = input.lines.exclude(/\[IMPL\]/).exclude(/\[INIT\]/).exclude(/\[PLATFORM\]/).exclude(/\[SPURIOUS\]/)

	var highFix = interfaceLines.filter(/\[HIGH\]/).count(/\[FIXABLE\]/)
	var lowFix = interfaceLines.filter(/\[LOW\]/).count(/\[FIXABLE\]/)
	var highUnfix = interfaceLines.filter(/\[HIGH\]/).count(/\[UNFIXABLE\]/)
	var lowUnfix = interfaceLines.filter(/\[LOW\]/).count(/\[UNFIXABLE\]/)
	var interfce = highFix + lowFix + highUnfix + lowUnfix;

	var spurious = input.lines.count(/\[SPURIOUS\]/)

	assert.equal(interfaceLines.length, highFix + lowFix + highUnfix + lowUnfix, "Some interface warnings were improperly classified in " + input.file)
	assert.equal(input.lines.length, impl + snapshot + interfce + spurious, "Some warning were underclassified or overclassified in " + input.file)

	// report(input.file, [highFix, lowFix, highUnfix, lowUnfix, impl, init, platform, spurious])
	report(input.file, [highFix + highUnfix, lowFix + lowUnfix, impl, init, platform, spurious])
})

output('TOTAL', sum)

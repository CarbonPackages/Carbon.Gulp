'use strict';

if (!config.tasks.jsLint) {
	return false;
}

const func = require('../functions');
const eslint = require('gulp-eslint');
const filesToWatch = func.getFilesToWatch('js');


function esLint(argument) {
	return gulp.src(filesToWatch, {since: gulp.lastRun('jsLint')})
		.pipe(plumber(handleErrors))
		.pipe(eslint())
		.pipe(eslint.results(results => {
			func.notifyText({
				warnings: results.warningCount,
				errors: results.errorCount,
				subtitle: 'ES Lint'
			});
		}))
		.pipe(eslint.format());
}

module.exports = esLint;

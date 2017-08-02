'use strict';

if (!config.tasks.scssLint) {
	return false;
}

const func         = require('../functions');
const lint         = require('gulp-scss-lint');
const filesToWatch = func.getFilesToWatch('css');

function scssLint(callback) {
	let reports = {
		warnings: 0,
		errors: 0
	};

	let reporter = (file) => {
		let result       = false;
		let lint         = file.scsslint;
		let log          = [];

		if (lint.success) {
			return result;
		} else {
			lint.issues.forEach(issue => {
				let reason = issue.reason.replace(/\s\s+/g, ' ').replace('after " ', 'after "');

				if (issue.severity === 'error') {
					reason = util.colors.red(reason);
				} else {
					reason = issue.linter + ': ' + util.colors.cyan(reason);
				}
				log.push([
					'',
					util.colors.gray('line ' + issue.line),
					util.colors.gray('col ' + issue.column),
					reason
				]);
			})
		}

		if (log.length) {
			let filePath = '.' + path.sep + path.relative(process.cwd(), file.path);
			let errorCount = lint.errors;
			let warningCount = lint.warnings;

			result = [
				util.colors.underline(filePath),
				textTable(log) + '\n'
			];

			if (errorCount) {
				errorCount += func.pluralize(' error', errorCount);
				result.push('  ' + util.colors.red(errorCount));
			}

			if (warningCount) {
				warningCount += func.pluralize(' warning', warningCount);
				result.push('  ' + util.colors.yellow(warningCount));
			}

			result = '\n' + result.join('\n') + '\n';
			console.log(result);
		}

		reports = {
			warnings: reports.warnings + lint.warnings,
			errors: reports.errors + lint.errors
		}
		return file;
	};

	let gulpLint = () => {
		return gulp.src(filesToWatch, {since: gulp.lastRun('scssLint')})
			.pipe(plumber(handleErrors))
			.pipe(lint({
				customReport: reporter
			}));
	};

	let summary = () => {
		func.notifyText({
			warnings: reports.warnings,
			errors: reports.errors,
			subtitle: 'SCSS-Lint'
		});
		callback();
	};


	bach.series(gulpLint, summary)();
}

module.exports = scssLint;

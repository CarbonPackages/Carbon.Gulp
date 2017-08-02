'use strict';

const func = require('./functions');

func.globalImport('config', './config');
func.globalImport('bach');
func.globalImport('glob');
func.globalImport('notifier', 'node-notifier');
func.globalImport('path');
func.globalImport('fs');
func.globalImport('textTable', 'text-table');
func.globalImport('through2');

global.browserSync = null;

global.flags = {
	'--b, --beautify': ' Beautify and dont\'t compress files',
	'--d, --debug':    ' Files dont\'t get compressed and sourcemaps get genereated',
	'--m, --maps':     ' Write sourcemaps',
};

global.gulpIcons = {
	error:   path.join(__dirname, 'assets/gulp-error.png'),
	warning: path.join(__dirname, 'assets/gulp-warning.png'),
	normal:  path.join(__dirname, 'assets/gulp.png')
};

global.getTimestamp = func.getTimestamp;
global.getExtensions = func.getExtensions;

// Overwrite Config with an external files
func.mergeConfigAndLoadTasks();

'use strict';

if (!config.tasks.compress) {
	return false;
}

const brotli = require('gulp-brotli');

let src = path.join(config.root.base, config.root.dest, '/**/*.{js,css}');

function compressBrotli() {
	return gulp.src(src)
		.pipe(brotli.compress())
		.pipe(gulp.dest(function(file) {
			return file.base;
	}));
}

module.exports = compressBrotli;

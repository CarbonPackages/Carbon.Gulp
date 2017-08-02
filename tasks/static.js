'use strict';

if (!config.tasks.static) {
	return false;
}

let paths = {
	src: path.join(config.root.base, config.root.src, config.tasks.static.src, '/**', getExtensions(config.tasks.static.extensions)),
	dest: path.join(config.root.base, config.root.dest, config.tasks.static.dest)
};

function copy() {
	return gulp.src(paths.src, {since: cache.lastMtime('static')})
		.pipe(plumber(handleErrors))
		.pipe(cache('static'))
		.pipe(changed(paths.dest)) // Ignore unchanged files
		.pipe(chmod(config.chmod))
		.pipe(gulp.dest(paths.dest))
		.pipe(size({
			title: 'Static Files:',
			showFiles: false
		})
	);
}

module.exports = copy;

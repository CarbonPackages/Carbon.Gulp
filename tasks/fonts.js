'use strict';

if (!config.tasks.fonts) {
	return false;
}

let paths = {
	src: path.join(config.root.base, config.root.src, config.tasks.fonts.src, '/**', getExtensions(config.tasks.fonts.extensions)),
	dest: path.join(config.root.base, config.root.dest, config.tasks.fonts.dest)
};

function fonts() {
	return gulp.src(paths.src, {since: cache.lastMtime('fonts')})
		.pipe(plumber(handleErrors))
		.pipe(cache('fonts'))
		.pipe(changed(paths.dest)) // Ignore unchanged files
		.pipe(flatten())
		.pipe(chmod(config.chmod))
		.pipe(gulp.dest(paths.dest))
		.pipe(size({
			title: 'Fonts:',
			showFiles: false
		})
	);
}

module.exports = fonts;

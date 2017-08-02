'use strict';

if (!config.tasks.images) {
	return false;
}

let paths = {
	src: path.join(config.root.base, config.root.src, config.tasks.images.src, '/**',  getExtensions(config.tasks.images.extensions)),
	dest: path.join(config.root.base, config.root.dest, config.tasks.images.dest)
};

function images() {
	return gulp.src(paths.src, {since: cache.lastMtime('images')})
		.pipe(plumber(handleErrors))
		.pipe(cache('images'))
		.pipe(changed(paths.dest)) // Ignore unchanged files
		.pipe(flatten())
		.pipe(chmod(config.chmod))
		.pipe(gulp.dest(paths.dest))
		.pipe(size({
			title: 'Images:',
			showFiles: false
		})
	);
}

module.exports = images;

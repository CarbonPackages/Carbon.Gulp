'use strict';
let paths = {
	src: path.join(config.root.base, config.root.src, config.tasks.images.src, '/**', getExtensions(config.tasks.images.extensions)),
	dest: path.join(config.root.base, config.root.dest, config.tasks.images.dest)
};
let conf = config.tasks.css.postcss.imagemin;

function optimizeImages() {
	return gulp.src(paths.src)
		.pipe(plumber(handleErrors))
		.pipe(imagemin([
			imagemin.gifsicle(conf.gifsicle),
			imagemin.jpegtran(conf.jpegtran),
			imagemin.optipng(conf.optipng),
			imagemin.svgo(conf.svgo)
		],{
			verbose: true
		}))
		.pipe(chmod(config.chmod))
		.pipe(size({
			title: 'Images:',
			showFiles: false
		})
	);
}

module.exports = optimizeImages;

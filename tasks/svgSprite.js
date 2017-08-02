'use strict';

if (!config.tasks.svgSprite) {
	return false;
}

const svgstore = require('gulp-svgstore');
let paths = {
	src: path.join(config.root.base, config.root.src, config.tasks.svgSprite.src, getExtensions(config.tasks.svgSprite.extensions)),
	dest: path.join(config.root.base, config.root.dest, config.tasks.svgSprite.dest)
};
function svgSprite() {
	return gulp.src(paths.src, {since: cache.lastMtime('svgSprite')})
		.pipe(plumber(handleErrors))
		.pipe(rename(path => {
			path.basename = 'icon-' + path.basename.toLowerCase();
		}))
		.pipe(cache('svgSprite'))
		.pipe(imagemin([imagemin.svgo({plugins:[config.tasks.svgSprite.svgo]})]))
		.pipe(svgstore())
		.pipe(gulp.dest(paths.dest))
		.pipe(size({
			title: 'SVG:',
			showFiles: true
		})
	);
}

module.exports = svgSprite;

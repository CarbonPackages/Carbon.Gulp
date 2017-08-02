'use strict';

if (!config.tasks.css) {
	return false;
}

const sass         = require('gulp-sass');
const postcss      = require('gulp-postcss');
const beautify     = require('gulp-cssbeautify');
const cssnano      = require('cssnano'); // https://github.com/ben-eb/cssnano
const autoprefixer = require('autoprefixer');

let pc         = config.tasks.css.postcss;
let assetspath = pc.assets.loadPaths;

let assetConf = pc.assets;
if (Array.isArray(assetConf.loadPaths)) {
	assetConf.loadPaths = assetConf.loadPaths.map(value => path.join(config.root.base, config.root.dest, value));
} else {
	assetConf.loadPaths = path.join(config.root.base, config.root.dest, assetConf.loadPaths);
}
assetConf.relative = path.join(config.root.base, config.root.dest, config.tasks.css.dest);

let postScss = [
	require('postcss-assets')(assetConf),
	require('postcss-magic-animations')(pc.magicAnimations),
	require('postcss-vmax'),
	require('postcss-short'),
	require('postcss-center'),
	require('postcss-grid-kiss')(pc.gridKiss),
	require('rucksack-css')(pc.rucksack),
	require('postcss-flexbox'),
	require('pleeease-filters'),
	require('postcss-selector-matches'),
	require('postcss-selector-not'),
	require('postcss-pseudoelements')(pc.pseudoelements),
	require('postcss-font-awesome'),
	require('postcss-custom-media'),
	require('postcss-media-minmax'),
	require('postcss-quantity-queries'),
	require('postcss-fixes')(pc.fixes),
	require('css-mqpacker')(pc.mqpacker),
	require('postcss-round-subpixels'),
	require('postcss-reporter')
];

if (pc.activateRtlCss) {
	postScss.unshift(require('postcss-rtl'));
}

if (pc.pxtorem) {
	postScss.push(require('postcss-pxtorem')(pc.pxtorem));
}


let paths = {
	src: path.join(config.root.base, config.root.src, config.tasks.css.src, getExtensions(config.tasks.css.extensions)),
	dest: path.join(config.root.base, config.root.dest, config.tasks.css.dest)
};

let saasConfig = config.tasks.css.sass;
saasConfig.imagePath = (config.tasks.css.dest ? '../' : '') + saasConfig.imagePath;

function css() {
	return gulp.src(paths.src, {since: cache.lastMtime('css')})
		.pipe(plumber(handleErrors))
		.pipe(mode.maps ? sourcemaps.init({loadMaps: true}) : util.noop())
		.pipe(sass(saasConfig))
		.pipe(flatten())
		.pipe(postcss(postScss))
		.pipe(mode.minimize ? postcss([cssnano(pc.cssnano)]) : postcss([autoprefixer(pc.cssnano.autoprefixer)]))
		.pipe(mode.beautify ? beautify(config.tasks.css.cssbeautifyOptions) : util.noop())
		.pipe(config.root.inlineAssets ? gulp.dest(path.join(config.root.base, config.root.inlineAssets)) : util.noop())
		.pipe(config.banner ? header(config.banner, {
			info: config.info,
			timestamp: getTimestamp()
		}) : util.noop())
		.pipe(chmod(config.chmod))
		.pipe(mode.maps ? sourcemaps.write() : util.noop())
		.pipe(gulp.dest(paths.dest))
		.pipe(browserSync ? browserSync.stream() : util.noop())
		.pipe(size({
			title: 'CSS:',
			showFiles: true
		}));
}

module.exports = css;

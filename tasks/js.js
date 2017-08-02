'use strict';

if (!config.tasks.js) {
	return false;
}

const gulpRollup = require('gulp-rollup');
const nodeResolve = require('rollup-plugin-node-resolve');
const includePaths = require('rollup-plugin-includepaths');
const rollupSourcemaps = require('rollup-plugin-sourcemaps');
const commonjs = require('rollup-plugin-commonjs');
const amd = require('rollup-plugin-amd');
const buble = require('rollup-plugin-buble');
const babel = require('rollup-plugin-babel');
const globals = require('rollup-plugin-node-globals');

const uglify = require('rollup-plugin-uglify');


let rollupConfig = config.tasks.js.rollup;
let paths = {
	src: path.join(config.root.base, config.root.src, config.tasks.js.src, getExtensions(config.tasks.js.extensions)),
	dest: path.join(config.root.base, config.root.dest, config.tasks.js.dest)
};

if (rollupConfig) {
	if (rollupConfig.plugins.includePaths.paths.length && rollupConfig.plugins.includePaths.paths[0] == '') {
		rollupConfig.plugins.includePaths.paths[0] = path.join(config.root.base, config.root.src);
	}
}

let rollupPlugins = [
	includePaths(rollupConfig.plugins.includePaths),
	nodeResolve(rollupConfig.plugins.nodeResolve)
];
if (rollupConfig.plugins.commonjs) {
	if (typeof rollupConfig.plugins.commonjs == 'boolean') {
		rollupPlugins.push(commonjs());
	} else {
		rollupPlugins.push(commonjs(rollupConfig.plugins.commonjs));
	}
}

if (rollupConfig.plugins.amd) {
	if (typeof rollupConfig.plugins.amd == 'boolean') {
		rollupPlugins.push(amd());
	} else {
		rollupPlugins.push(amd(rollupConfig.plugins.amd));
	}
}

rollupPlugins.push(rollupSourcemaps());
rollupPlugins.push(globals());
if (rollupConfig.buble) { rollupPlugins.push(buble()); }
if (!rollupConfig.buble) { rollupPlugins.push(babel()); }

if (mode.minimize) { rollupPlugins.push(uglify({mangle : true})); }

function js() {
	return gulp.src(paths.src, {since: cache.lastMtime('js')})
		.pipe(plumber(handleErrors))
		.pipe(mode.maps ? sourcemaps.init({loadMaps: true}) : util.noop())
		.pipe(gulpRollup({
			rollup: require('rollup'),
			entry: new Promise((resolve, reject) => {
				glob(paths.src, (error, files) => {
					resolve(files);
				});
			}),
			allowRealFiles: true,
			plugins: rollupPlugins,
			format: rollupConfig.format
		}))
		.pipe(config.root.inlineAssets ? gulp.dest(path.join(config.root.base, config.root.inlineAssets)) : util.noop())
		.pipe(config.banner ? header(config.banner, {
			info: config.info,
			timestamp: getTimestamp()
		}) : util.noop())
		.pipe(mode.maps ? sourcemaps.write() : util.noop())
		.pipe(gulp.dest(paths.dest))
		.pipe(browserSync ? browserSync.stream() : util.noop())
		.pipe(size({
			title: 'JS:',
			showFiles: true
		}));
}

module.exports = js;

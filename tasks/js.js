"use strict";

if (!config.tasks.js) {
    return false;
}

const amd = require("rollup-plugin-amd");
const buble = require("rollup-plugin-buble");
const babel = require("rollup-plugin-babel");
const cjs = require("rollup-plugin-commonjs");
const globals = require("rollup-plugin-node-globals");
const gulpRollup = require("gulp-rollup");
const includePaths = require("rollup-plugin-includepaths");
const replace = require("rollup-plugin-replace");
const resolve = require("rollup-plugin-node-resolve");
const rollupSourcemaps = require("rollup-plugin-sourcemaps");
const uglify = require("rollup-plugin-uglify");

let rollupConfig = config.tasks.js.rollup;
let paths = {
    src: path.join(
        config.root.base,
        config.root.src,
        config.tasks.js.src,
        config.tasks.js.file || getExtensions(config.tasks.js.extensions)
    ),
    dest: path.join(config.root.base, config.root.dest, config.tasks.js.dest)
};

if (rollupConfig) {
    if (
        rollupConfig.plugins.includePaths.paths.length &&
        rollupConfig.plugins.includePaths.paths[0] == ""
    ) {
        rollupConfig.plugins.includePaths.paths[0] = path.join(
            config.root.base,
            config.root.src
        );
    }
}

let rollupPlugins = [
    includePaths(rollupConfig.plugins.includePaths),
    resolve(rollupConfig.plugins.nodeResolve),
    replace({
        "process.env.NODE_ENV": JSON.stringify(mode.minimize ? 'production' : 'development')
    })
];

if (rollupConfig.plugins.commonjs) {
    if (typeof rollupConfig.plugins.commonjs == "boolean") {
        rollupPlugins.push(cjs());
    } else {
        rollupPlugins.push(cjs(rollupConfig.plugins.commonjs));
    }
}
if (rollupConfig.plugins.amd) {
    if (typeof rollupConfig.plugins.amd == "boolean") {
        rollupPlugins.push(amd());
    } else {
        rollupPlugins.push(amd(rollupConfig.plugins.amd));
    }
}

if (config.tasks.js.compiler.toLowerCase() == "babel") {
    rollupPlugins.push(babel(config.tasks.js.babel));
} else {
    rollupPlugins.push(buble(config.tasks.js.buble));
}

rollupPlugins.push(globals());
rollupPlugins.push(rollupSourcemaps());

if (mode.minimize) {
    rollupPlugins.push(uglify({ mangle: true }));
}

function js() {
    return gulp
        .src(paths.src, { since: cache.lastMtime("js") })
        .pipe(plumber(handleErrors))
        .pipe(mode.maps ? sourcemaps.init({ loadMaps: true }) : util.noop())
        .pipe(
            gulpRollup({
                rollup: require("rollup"),
                input: new Promise((resolve, reject) => {
                    glob(paths.src, (error, files) => {
                        resolve(files);
                    });
                }),
                allowRealFiles: true,
                plugins: rollupPlugins,
                format: rollupConfig.format
            })
        )
        .pipe(
            config.root.inlineAssets
                ? gulp.dest(
                      path.join(
                          config.root.base,
                          config.root.src,
                          config.root.inlinePath
                      )
                  )
                : util.noop()
        )
        .pipe(
            config.banner
                ? header(config.banner, {
                      info: config.info,
                      timestamp: getTimestamp()
                  })
                : util.noop()
        )
        .pipe(mode.maps ? sourcemaps.write("") : util.noop())
        .pipe(gulp.dest(paths.dest))
        .pipe(browserSync ? browserSync.stream() : util.noop())
        .pipe(
            size({
                title: "JS:",
                showFiles: true
            })
        );
}

module.exports = js;

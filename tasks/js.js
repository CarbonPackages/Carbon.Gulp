"use strict";

if (!config.tasks.js) {
    return false;
}

const ROLLUP_PLUGIN = {
    AMD: require("rollup-plugin-amd"),
    BABEL: require("rollup-plugin-babel"),
    BUBLE: require("rollup-plugin-buble"),
    CJS: require("rollup-plugin-commonjs"),
    GLOBALS: require("rollup-plugin-node-globals"),
    GULP: require("gulp-rollup"),
    INCLUDEPATHS: require("rollup-plugin-includepaths"),
    REPLACE: require("rollup-plugin-replace"),
    RESOLVE: require("rollup-plugin-node-resolve"),
    SOURCEMAPS: require("rollup-plugin-sourcemaps"),
    UGLIFY: require("rollup-plugin-uglify")
};

const PACKAGES_CONFIG = [];
for (let key in config.packages) {
    const CONFIG = config.packages[key];
    const JS_CONFIG = CONFIG.tasks.js;

    if (JS_CONFIG) {
        let rollup = {
            config: JS_CONFIG.rollup,
            plugins: []
        };

        if (rollup.config) {
            if (
                rollup.config.plugins.includePaths.paths.length &&
                rollup.config.plugins.includePaths.paths[0] == ""
            ) {
                rollup.config.plugins.includePaths.paths[0] = path.join(
                    CONFIG.root.base,
                    CONFIG.root.src
                );
            }
            rollup.plugins = [
                ROLLUP_PLUGIN.INCLUDEPATHS(rollup.config.plugins.includePaths),
                ROLLUP_PLUGIN.RESOLVE(rollup.config.plugins.nodeResolve),
                ROLLUP_PLUGIN.REPLACE({
                    "process.env.NODE_ENV": JSON.stringify(
                        mode.minimize ? "production" : "development"
                    )
                })
            ];

            if (rollup.config.plugins.commonjs) {
                if (typeof rollup.config.plugins.commonjs == "boolean") {
                    rollup.plugins.push(ROLLUP_PLUGIN.CJS());
                } else {
                    rollup.plugins.push(
                        ROLLUP_PLUGIN.CJS(rollup.config.plugins.commonjs)
                    );
                }
            }
            if (rollup.config.plugins.amd) {
                if (typeof rollup.config.plugins.amd == "boolean") {
                    rollup.plugins.push(ROLLUP_PLUGIN.AMD());
                } else {
                    rollup.plugins.push(
                        ROLLUP_PLUGIN.AMD(rollup.config.plugins.amd)
                    );
                }
            }

            if (config.tasks.js.compiler.toLowerCase() == "babel") {
                rollup.plugins.push(ROLLUP_PLUGIN.BABEL(config.tasks.js.babel));
            } else {
                rollup.plugins.push(ROLLUP_PLUGIN.BUBLE(config.tasks.js.buble));
            }

            rollup.plugins.push(ROLLUP_PLUGIN.GLOBALS());
            rollup.plugins.push(ROLLUP_PLUGIN.SOURCEMAPS());
        }

        if (mode.minimize) {
            rollup.plugins.push(ROLLUP_PLUGIN.UGLIFY({ mangle: true }));
        }

        PACKAGES_CONFIG.push({
            key: key,
            info: CONFIG.info,
            rollup: rollup,
            src: path.join(
                CONFIG.root.base,
                key,
                CONFIG.root.src,
                JS_CONFIG.src,
                JS_CONFIG.file || getExtensions(JS_CONFIG.extensions)
            ),
            dest: path.join(
                CONFIG.root.base,
                key,
                CONFIG.root.dest,
                JS_CONFIG.dest
            ),
            inlinePath: CONFIG.root.inlineAssets
                ? path.join(
                      CONFIG.root.base,
                      key,
                      CONFIG.root.src,
                      CONFIG.root.inlinePath
                  )
                : false
        });
    }
}

function js() {
    let tasks = PACKAGES_CONFIG.map(packageConfig => {
        return gulp
            .src(packageConfig.src, {
                since: cache.lastMtime("js")
            })
            .pipe(plumber(handleErrors))
            .pipe(mode.maps ? sourcemaps.init({ loadMaps: true }) : util.noop())
            .pipe(
                ROLLUP_PLUGIN.GULP({
                    rollup: require("rollup"),
                    input: new Promise((resolve, reject) => {
                        glob(packageConfig.src, (error, files) => {
                            resolve(files);
                        });
                    }),
                    allowRealFiles: true,
                    plugins: packageConfig.rollup.plugins,
                    format: packageConfig.rollup.config.format
                })
            )
            .pipe(chmod(config.global.chmod))
            .pipe(
                packageConfig.inlinePath
                    ? gulp.dest(packageConfig.inlinePath)
                    : util.noop()
            )
            .pipe(
                packageConfig.info.banner &&
                packageConfig.info.author &&
                packageConfig.info.homepage
                    ? header(packageConfig.info.banner, {
                          package: packageConfig.key,
                          author: packageConfig.info.author,
                          homepage: packageConfig.info.homepage,
                          timestamp: getTimestamp()
                      })
                    : util.noop()
            )
            .pipe(mode.maps ? sourcemaps.write("") : util.noop())
            .pipe(gulp.dest(packageConfig.dest))
            .pipe(browserSync ? browserSync.stream() : util.noop())
            .pipe(
                size({
                    title: `${packageConfig.key} JS:`,
                    showFiles: true
                })
            );
    });
    return merge(tasks);
}

module.exports = js;

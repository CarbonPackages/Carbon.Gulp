"use strict";

const ROLLUP_PLUGIN = {
    AMD: require("rollup-plugin-amd"),
    BABEL: require("rollup-plugin-babel"),
    BUBLE: require("rollup-plugin-buble"),
    CJS: require("rollup-plugin-commonjs"),
    GLOBALS: require("rollup-plugin-node-globals"),
    INCLUDEPATHS: require("rollup-plugin-includepaths"),
    REPLACE: require("rollup-plugin-replace"),
    RESOLVE: require("rollup-plugin-node-resolve"),
    SOURCEMAPS: require("rollup-plugin-sourcemaps"),
    UGLIFY: require("rollup-plugin-uglify")
};

const ROLLUP_EACH = require("gulp-rollup-each");

function getConfig(taskName) {
    const PACKAGES_CONFIG = [];
    for (let key in config.packages) {
        const CONFIG = config.packages[key];
        const JS_CONFIG = CONFIG.tasks[taskName];

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
                    ROLLUP_PLUGIN.INCLUDEPATHS(
                        rollup.config.plugins.includePaths
                    ),
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

                if (JS_CONFIG.compiler.toLowerCase() == "babel") {
                    rollup.plugins.push(ROLLUP_PLUGIN.BABEL(JS_CONFIG.babel));
                } else {
                    rollup.plugins.push(ROLLUP_PLUGIN.BUBLE(JS_CONFIG.buble));
                }

                rollup.plugins.push(ROLLUP_PLUGIN.GLOBALS());
                rollup.plugins.push(ROLLUP_PLUGIN.SOURCEMAPS());
            }

            if (mode.minimize) {
                rollup.plugins.push(ROLLUP_PLUGIN.UGLIFY({ mangle: true }));
            }

            PACKAGES_CONFIG.push({
                key: key
                    ? key
                    : CONFIG.info.package
                        ? CONFIG.info.package
                        : false,
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

    return PACKAGES_CONFIG;
}

function jsRender(taskName) {
    const PACKAGES_CONFIG = getConfig(taskName);

    let tasks = PACKAGES_CONFIG.map(packageConfig => {
        return gulp
            .src(packageConfig.src, {
                since: cache.lastMtime(taskName)
            })
            .pipe(plumber(handleErrors))
            .pipe(mode.maps ? sourcemaps.init({ loadMaps: true }) : noop())
            .pipe(
                ROLLUP_EACH(
                    {
                        plugins: packageConfig.rollup.plugins
                    },
                    file => {
                        return {
                            format: packageConfig.rollup.config.format,
                            name: path.parse(file.path)["name"]
                        };
                    },
                    require("rollup")
                )
            )
            .pipe(chmod(config.global.chmod))
            .pipe(
                packageConfig.inlinePath
                    ? gulp.dest(packageConfig.inlinePath)
                    : noop()
            )
            .pipe(
                packageConfig.key &&
                packageConfig.info.banner &&
                packageConfig.info.author &&
                packageConfig.info.homepage
                    ? header(packageConfig.info.banner, {
                          package: packageConfig.key,
                          author: packageConfig.info.author,
                          homepage: packageConfig.info.homepage,
                          timestamp: getTimestamp()
                      })
                    : noop()
            )
            .pipe(mode.maps ? sourcemaps.write("") : noop())
            .pipe(plumber.stop())
            .pipe(gulp.dest(packageConfig.dest))
            .pipe(
                size({
                    title: `${packageConfig.key} ${taskName.toUpperCase()}:`,
                    showFiles: true
                })
            );
    });
    return merge(tasks);
}

module.exports = jsRender;

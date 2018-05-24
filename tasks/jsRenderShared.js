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
    TERSER: require("rollup-plugin-terser").terser
};

const ROLLUP_EACH = require("gulp-rollup-each");

function getConfig(taskName) {
    const TASK_CONFIG = [];
    for (const KEY in config.packages) {
        const CONFIG = config.packages[KEY];
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
                rollup.plugins.push(
                    ROLLUP_PLUGIN.TERSER(rollup.config.plugins.terser)
                );
            }

            TASK_CONFIG.push({
                key: KEY
                    ? KEY
                    : CONFIG.info.package
                        ? CONFIG.info.package
                        : false,
                info: CONFIG.info,
                rollup: rollup,
                src: path.join(
                    CONFIG.root.base,
                    KEY,
                    CONFIG.root.src,
                    JS_CONFIG.src,
                    getFiles(JS_CONFIG.file) ||
                        getExtensions(JS_CONFIG.extensions)
                ),
                dest: path.join(
                    CONFIG.root.base,
                    KEY,
                    CONFIG.root.dest,
                    JS_CONFIG.dest
                ),
                inlinePath: CONFIG.root.inlineAssets
                    ? path.join(
                          CONFIG.root.base,
                          KEY,
                          CONFIG.root.src,
                          CONFIG.root.inlinePath
                      )
                    : false
            });
        }
    }

    return TASK_CONFIG;
}

function jsRender(taskName) {
    const TASK_CONFIG = getConfig(taskName);

    return merge(
        TASK_CONFIG.map(task => {
            return gulp
                .src(task.src, {
                    since: cache.lastMtime(taskName)
                })
                .pipe(plumber(handleErrors))
                .pipe(mode.maps ? sourcemaps.init({ loadMaps: true }) : noop())
                .pipe(
                    ROLLUP_EACH(
                        {
                            plugins: task.rollup.plugins
                        },
                        file => {
                            return {
                                format: task.rollup.config.format,
                                name: path.parse(file.path)["name"]
                            };
                        },
                        require("rollup")
                    )
                )
                .pipe(chmod(config.global.chmod))
                .pipe(task.inlinePath ? gulp.dest(task.inlinePath) : noop())
                .pipe(
                    task.key &&
                    task.info.banner &&
                    task.info.author &&
                    task.info.homepage
                        ? header(task.info.banner, {
                              package: task.key,
                              author: task.info.author,
                              homepage: task.info.homepage,
                              timestamp: getTimestamp()
                          })
                        : noop()
                )
                .pipe(mode.maps ? sourcemaps.write("") : noop())
                .pipe(plumber.stop())
                .pipe(gulp.dest(task.dest))
                .pipe(sizeOutput(task.key, taskName.toUpperCase()));
        })
    );
}

module.exports = jsRender;

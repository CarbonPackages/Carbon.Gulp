const ROLLUP_PLUGIN = {
    AMD: require('rollup-plugin-amd'),
    BABEL: require('@rollup/plugin-babel').babel,
    BUBLE: require('@rollup/plugin-buble'),
    BUILTINS: require('rollup-plugin-node-builtins'),
    CJS: require('@rollup/plugin-commonjs'),
    GLOBALS: require('rollup-plugin-node-globals'),
    INCLUDEPATHS: require('rollup-plugin-includepaths'),
    REPLACE: require('@rollup/plugin-replace'),
    RESOLVE: require('@rollup/plugin-node-resolve').default,
    SOURCEMAPS: require('rollup-plugin-sourcemaps'),
    TERSER: require('rollup-plugin-terser').terser
};

const ROLLUP_LIBRARY = require('rollup');
const ROLLUP_EACH = require('gulp-rollup-each');

function getConfig(taskName) {
    const TASK_CONFIG = [];
    for (const KEY in config.packages) {
        const CONFIG = config.packages[KEY];
        const JS_CONFIG = CONFIG.tasks[taskName];

        if (JS_CONFIG) {
            const SOURCEMAP = mode.maps && JS_CONFIG.sourceMaps;
            const PATHS = {
                key: path.join(CONFIG.root.base || '', KEY)
            };
            PATHS.root = {
                src: path.join(PATHS.key, CONFIG.root.src || ''),
                dest: path.join(PATHS.key, CONFIG.root.dest || '')
            };
            PATHS.dest = {
                private: path.join(
                    PATHS.root.src,
                    CONFIG.root.inlinePath || ''
                ),
                public: path.join(PATHS.root.dest, JS_CONFIG.dest || '')
            };
            PATHS.base = path.join(PATHS.root.src, JS_CONFIG.src || '');

            let rollup = {
                config: JS_CONFIG.rollup,
                plugins: []
            };

            if (rollup.config) {
                let includePaths = rollup.config.plugins.includePaths;
                if (
                    includePaths.paths &&
                    includePaths.paths[0] == 'COMPOSER_PACKAGES'
                ) {
                    includePaths.paths[0] = PATHS.root.src;
                }
                rollup.plugins = [
                    ROLLUP_PLUGIN.INCLUDEPATHS(includePaths),
                    ROLLUP_PLUGIN.RESOLVE(rollup.config.plugins.nodeResolve),
                    ROLLUP_PLUGIN.REPLACE({
                        'process.env.NODE_ENV': JSON.stringify(
                            mode.minimize ? 'production' : 'development'
                        )
                    })
                ];

                if (rollup.config.plugins.commonjs) {
                    if (typeof rollup.config.plugins.commonjs == 'boolean') {
                        rollup.plugins.push(ROLLUP_PLUGIN.CJS());
                    } else {
                        rollup.plugins.push(
                            ROLLUP_PLUGIN.CJS(rollup.config.plugins.commonjs)
                        );
                    }
                }
                if (rollup.config.plugins.amd) {
                    if (typeof rollup.config.plugins.amd == 'boolean') {
                        rollup.plugins.push(ROLLUP_PLUGIN.AMD());
                    } else {
                        rollup.plugins.push(
                            ROLLUP_PLUGIN.AMD(rollup.config.plugins.amd)
                        );
                    }
                }

                if (JS_CONFIG.compiler.toLowerCase() == 'babel') {
                    rollup.plugins.push(ROLLUP_PLUGIN.BABEL(JS_CONFIG.babel));
                } else {
                    rollup.plugins.push(ROLLUP_PLUGIN.BUBLE(JS_CONFIG.buble));
                }

                rollup.plugins.push(ROLLUP_PLUGIN.GLOBALS());

                if (rollup.config.plugins.builtins) {
                    rollup.plugins.push(ROLLUP_PLUGIN.BUILTINS());
                }

                if (SOURCEMAP) {
                    rollup.plugins.push(ROLLUP_PLUGIN.SOURCEMAPS());
                }
            }

            if (mode.minimize && rollup.config.plugins.terser) {
                rollup.plugins.push(
                    ROLLUP_PLUGIN.TERSER(rollup.config.plugins.terser)
                );
            }

            TASK_CONFIG.push({
                key: KEY || CONFIG.info.package || false,
                info: CONFIG.info,
                sourcemap: SOURCEMAP,
                rollup: rollup,
                dest: PATHS.dest,
                src: {
                    private: getSrcPath({
                        basePath: PATHS.base,
                        extensions: JS_CONFIG.extensions,
                        file: JS_CONFIG.file,
                        inline: true
                    }),
                    public: getSrcPath({
                        basePath: PATHS.base,
                        extensions: JS_CONFIG.extensions,
                        file: JS_CONFIG.file
                    })
                }
            });
        }
    }

    return TASK_CONFIG;
}

function jsRender(taskName) {
    const TASK_CONFIG = getConfig(taskName);

    return merge(
        TASK_CONFIG.map(task => {
            function rollupPipe() {
                return ROLLUP_EACH(
                    {
                        isCache: task.rollup.config.useCache,
                        plugins: task.rollup.plugins
                    },
                    file => {
                        return {
                            format: task.rollup.config.format,
                            name: path.parse(file.path)['name']
                        };
                    },
                    ROLLUP_LIBRARY
                );
            }
            let array = [];
            if (task.src.private) {
                array.push(
                    gulp
                        .src(task.src.private)
                        .pipe(plumber(handleErrors))
                        .pipe(rollupPipe())
                        .pipe(chmod(config.global.chmod))
                        .pipe(plumber.stop())
                        .pipe(gulp.dest(task.dest.private))
                        .pipe(
                            sizeOutput(task.key, taskName.toUpperCase(), false)
                        )
                );
            }
            if (task.src.public) {
                array.push(
                    gulp
                        .src(task.src.public)
                        .pipe(plumber(handleErrors))
                        .pipe(
                            task.sourcemap
                                ? task.sourcemap.options
                                    ? sourcemaps.init(task.sourcemap.options)
                                    : sourcemaps.init()
                                : noop()
                        )
                        .pipe(
                            task.sourcemap && task.sourcemap.identityMap
                                ? sourcemaps.identityMap()
                                : noop()
                        )
                        .pipe(rollupPipe())
                        .pipe(chmod(config.global.chmod))
                        .pipe(pipeBanner(task))
                        .pipe(task.sourcemap ? sourcemaps.write('') : noop())
                        .pipe(plumber.stop())
                        .pipe(gulp.dest(task.dest.public))
                        .pipe(sizeOutput(task.key, taskName.toUpperCase()))
                );
            }
            return merge(array);
        })
    );
}

module.exports = jsRender;

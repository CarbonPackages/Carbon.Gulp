const sureArray = require('../functions/sureArray');

const PATHS = {};

function addPostCSSPlugin(key, config) {
    if (typeof config == 'object') {
        return require(key)(config);
    } else if (config === true) {
        return require(key);
    }
    return null;
}

function addPostCSSPlugins(object) {
    let array = [];
    if (typeof object == 'object') {
        for (const key in object) {
            array.push(addPostCSSPlugin(key, object[key]));
        }
    }
    return array;
}

function postcssAssets(config, KEY) {
    if (!config || typeof config != 'object') {
        return { private: null, public: null };
    }
    let plugin = require('postcss-assets');
    let loadPaths = [];
    ['dest', 'src'].forEach(target => {
        let conf = sureArray(config.loadPaths[target]);
        if (conf) {
            conf.forEach(value => {
                loadPaths.push(path.join(PATHS.root[target], value));
            });
        }
    });

    return {
        private: plugin(
            objectAssignDeep({}, config.private, {
                relative: false,
                loadPaths: sureArray(config.loadPaths.src).map(value =>
                    path.join(config.loadPaths.srcRelativeToDest, value)
                ),
                basePath: path.join(PATHS.root.dest, config.loadPaths.dest),
                baseUrl: path.join(
                    config.private.baseUrl.replace('%KEY%', KEY),
                    config.loadPaths.dest
                )
            })
        ),
        public: plugin(
            objectAssignDeep({}, config.public, {
                loadPaths: loadPaths,
                relative: PATHS.dest.public
            })
        )
    };
}

function getConfig() {
    const sassTildeImporter = require('node-sass-tilde-importer');
    const TASK_CONFIG = [];
    for (const KEY in config.packages) {
        const CONFIG = config.packages[KEY];
        const CSS_CONFIG = CONFIG.tasks.css;

        if (CSS_CONFIG) {
            PATHS.key = path.join(CONFIG.root.base || '', KEY);
            PATHS.root = {
                src: path.join(PATHS.key, CONFIG.root.src || ''),
                dest: path.join(PATHS.key, CONFIG.root.dest || '')
            };
            PATHS.dest = {
                private: path.join(
                    PATHS.root.src,
                    CONFIG.root.inlinePath || ''
                ),
                public: path.join(PATHS.root.dest, CSS_CONFIG.dest || '')
            };
            PATHS.base = path.join(PATHS.root.src, CSS_CONFIG.src || '');

            // Sass Configuration
            let sassConfig = CSS_CONFIG.sass;
            sassConfig.imagePath =
                (CSS_CONFIG.dest ? '../' : '') + sassConfig.imagePath;
            sassConfig.importer = sassTildeImporter;

            // PostCSS Configuration
            let postcssConfig = [];
            Array.prototype.push.apply(
                postcssConfig,
                addPostCSSPlugins(CSS_CONFIG.postcss.beforeDefault)
            );
            Array.prototype.push.apply(
                postcssConfig,
                addPostCSSPlugins(CSS_CONFIG.postcss.default)
            );
            Array.prototype.push.apply(
                postcssConfig,
                addPostCSSPlugins(CSS_CONFIG.postcss.afterDefault)
            );

            // special treatment
            let SPECIAL = CSS_CONFIG.postcss.specialTreatment;
            const POSTCSS_ASSETS = postcssAssets(
                SPECIAL['postcss-assets'],
                KEY
            );
            postcssConfig.push(
                addPostCSSPlugin('autoprefixer', SPECIAL.autoprefixer)
            );
            if (mode.minimize) {
                postcssConfig.push(
                    addPostCSSPlugin('cssnano', SPECIAL.cssnano)
                );
            }
            postcssConfig.push(
                addPostCSSPlugin(
                    'postcss-reporter',
                    SPECIAL['postcss-reporter']
                )
            );

            TASK_CONFIG.push({
                key: KEY || CONFIG.info.package || false,
                info: CONFIG.info,
                sourceMaps: CSS_CONFIG.sourceMaps,
                sass: sassConfig,
                postcss: {
                    private: [POSTCSS_ASSETS.private]
                        .concat(postcssConfig)
                        .filter(value => value),
                    public: [POSTCSS_ASSETS.public]
                        .concat(postcssConfig)
                        .filter(value => value)
                },
                beautifyOptions: CSS_CONFIG.cssbeautifyOptions,
                dest: PATHS.dest,
                src: {
                    private: getSrcPath({
                        basePath: PATHS.base,
                        extensions: CSS_CONFIG.extensions,
                        file: CSS_CONFIG.file,
                        inline: true
                    }),
                    public: getSrcPath({
                        basePath: PATHS.base,
                        extensions: CSS_CONFIG.extensions,
                        file: CSS_CONFIG.file
                    })
                }
            });
        }
    }
    return TASK_CONFIG;
}

function getTask() {
    const sass = require('gulp-sass');
    const postcss = require('gulp-postcss');
    const beautify = require('gulp-cssbeautify');
    const TASK_CONFIG = getConfig();
    sass.compiler = require('node-sass');

    return merge(
        TASK_CONFIG.map(task => {
            let array = [];
            if (task.src.private) {
                array.push(
                    gulp
                        .src(task.src.private)
                        .pipe(plumber(handleErrors))
                        .pipe(sass(task.sass))
                        .pipe(flatten())
                        .pipe(postcss(task.postcss.private))
                        .pipe(
                            mode.beautify
                                ? beautify(task.beautifyOptions)
                                : noop()
                        )
                        .pipe(chmod(config.global.chmod))
                        .pipe(plumber.stop())
                        .pipe(gulp.dest(task.dest.private))
                        .pipe(sizeOutput(task.key, 'CSS', false))
                );
            }
            if (task.src.public) {
                array.push(
                    gulp
                        .src(task.src.public)
                        .pipe(plumber(handleErrors))
                        .pipe(
                            mode.maps && task.sourceMaps
                                ? task.sourceMaps.options
                                    ? sourcemaps.init(task.sourceMaps.options)
                                    : sourcemaps.init()
                                : noop()
                        )
                        .pipe(
                            mode.maps &&
                                task.sourceMaps &&
                                task.sourceMaps.identityMap
                                ? sourcemaps.identityMap()
                                : noop()
                        )
                        .pipe(sass(task.sass))
                        .pipe(flatten())
                        .pipe(postcss(task.postcss.public))
                        .pipe(
                            mode.beautify
                                ? beautify(task.beautifyOptions)
                                : noop()
                        )
                        .pipe(chmod(config.global.chmod))
                        .pipe(pipeBanner(task))
                        .pipe(
                            mode.maps && task.sourceMaps
                                ? sourcemaps.write('')
                                : noop()
                        )
                        .pipe(plumber.stop())
                        .pipe(gulp.dest(task.dest.public))
                        .pipe(browserSync ? browserSync.stream() : noop())
                        .pipe(sizeOutput(task.key, 'CSS'))
                );
            }
            return merge(array);
        })
    );
}

module.exports = exportTask('css', getTask);

function getConfig() {
    const sassTildeImporter = require("node-sass-tilde-importer");
    const POSTCSS_PLUGIN = {
        AUTOPREFIXER: require("autoprefixer"),
        CENTER: require("postcss-center"),
        CLIP_PATH: require("postcss-clip-path-polyfill"),
        CSS_MQPACKER: require("css-mqpacker"),
        FIXES: require("postcss-fixes"),
        FLEXBOX: require("postcss-flexbox"),
        FOCUS: require("postcss-focus"),
        MOMENTUM_SCROLLING: require("postcss-momentum-scrolling"),
        PLEEEASE_FILTERS: require("pleeease-filters"),
        PRESET_ENV: require("postcss-preset-env"),
        PSEUDOELEMENTS: require("postcss-pseudoelements"),
        PXTOREM: require("postcss-pxtorem"),
        QUANTITY_QUERIES: require("postcss-quantity-queries"),
        ROUND_SUBPIXELS: require("postcss-round-subpixels"),
        RTL: require("postcss-rtl"),
        RUCKSACK_CSS: require("rucksack-css"),
        SHORT: require("postcss-short"),
        SORT_CSS_MEDIA_QUERIES: require("sort-css-media-queries"),
        VMAX: require("postcss-vmax")
    };
    const TASK_CONFIG = [];
    for (const KEY in config.packages) {
        const CONFIG = config.packages[KEY];
        const CSS_CONFIG = CONFIG.tasks.css;

        if (CSS_CONFIG) {
            const PATHS = {
                key: path.join(CONFIG.root.base, KEY)
            };
            PATHS.root = {
                src: path.join(PATHS.key, CONFIG.root.src),
                dest: path.join(PATHS.key, CONFIG.root.dest)
            };
            PATHS.dest = {
                private: path.join(PATHS.root.src, CONFIG.root.inlinePath),
                public: path.join(PATHS.root.dest, CSS_CONFIG.dest)
            };
            PATHS.base = path.join(PATHS.root.src, CSS_CONFIG.src);

            // Sass Configuration
            let sassConfig = CSS_CONFIG.sass;
            sassConfig.imagePath =
                (CSS_CONFIG.dest ? "../" : "") + sassConfig.imagePath;
            sassConfig.importer = sassTildeImporter;

            // PostCSS Configuration
            const POSTCSS_CONFIGURATION = CSS_CONFIG.postcss;

            let loadPathsConf = POSTCSS_CONFIGURATION.assets.loadPaths;
            let loadPaths = [];
            if (loadPathsConf.dest) {
                loadPaths.push(path.join(PATHS.root.dest, loadPathsConf.dest));
            }
            if (loadPathsConf.src && Array.isArray(loadPathsConf.src)) {
                loadPathsConf.src.forEach(value => {
                    loadPaths.push(path.join(PATHS.root.src, value));
                });
            }

            const POSTCSS_ASSET_CONFIG = {
                private: objectAssignDeep(
                    {},
                    POSTCSS_CONFIGURATION.assets.private,
                    {
                        relative: false,
                        loadPaths: loadPathsConf.src.map(value =>
                            path.join(loadPathsConf.srcRelativeToDest, value)
                        ),
                        basePath: path.join(
                            PATHS.root.dest,
                            loadPathsConf.dest
                        ),
                        baseUrl: path.join(
                            POSTCSS_CONFIGURATION.assets.private.baseUrl.replace(
                                "%KEY%",
                                KEY
                            ),
                            loadPathsConf.dest
                        )
                    }
                ),
                public: objectAssignDeep(
                    {},
                    POSTCSS_CONFIGURATION.assets.public,
                    {
                        loadPaths: loadPaths,
                        relative: PATHS.dest.public
                    }
                )
            };

            let postcssConfig = [
                POSTCSS_PLUGIN.PRESET_ENV(POSTCSS_CONFIGURATION.presetEnv),
                POSTCSS_PLUGIN.VMAX,
                POSTCSS_PLUGIN.CLIP_PATH,
                POSTCSS_PLUGIN.SHORT(POSTCSS_CONFIGURATION.short),
                POSTCSS_PLUGIN.CENTER,
                POSTCSS_PLUGIN.RUCKSACK_CSS(POSTCSS_CONFIGURATION.rucksack),
                POSTCSS_PLUGIN.FLEXBOX,
                POSTCSS_PLUGIN.FOCUS,
                POSTCSS_PLUGIN.PLEEEASE_FILTERS,
                POSTCSS_PLUGIN.PSEUDOELEMENTS(
                    POSTCSS_CONFIGURATION.pseudoelements
                ),
                POSTCSS_PLUGIN.QUANTITY_QUERIES,
                POSTCSS_PLUGIN.MOMENTUM_SCROLLING(
                    POSTCSS_CONFIGURATION.momentumScrolling
                ),
                POSTCSS_PLUGIN.FIXES(POSTCSS_CONFIGURATION.fixes),
                POSTCSS_PLUGIN.CSS_MQPACKER({
                    sort: POSTCSS_CONFIGURATION.mqpacker.sort
                        ? POSTCSS_PLUGIN.SORT_CSS_MEDIA_QUERIES
                        : false
                }),
                POSTCSS_PLUGIN.ROUND_SUBPIXELS
            ];

            if (POSTCSS_CONFIGURATION.activateRtlCss) {
                postcssConfig.unshift(POSTCSS_PLUGIN.RTL);
            }

            if (POSTCSS_CONFIGURATION.pxtorem) {
                postcssConfig.push(
                    POSTCSS_PLUGIN.PXTOREM(POSTCSS_CONFIGURATION.pxtorem)
                );
            }

            if (POSTCSS_CONFIGURATION.autoprefixer) {
                postcssConfig.push(
                    POSTCSS_PLUGIN.AUTOPREFIXER(
                        POSTCSS_CONFIGURATION.autoprefixer
                    )
                );
            }

            TASK_CONFIG.push({
                key: KEY
                    ? KEY
                    : CONFIG.info.package
                        ? CONFIG.info.package
                        : false,
                info: CONFIG.info,
                sourceMaps: CSS_CONFIG.sourceMaps,
                sass: sassConfig,
                postcssConfig: postcssConfig,
                postcssAsset: POSTCSS_ASSET_CONFIG,
                cssnano: POSTCSS_CONFIGURATION.cssnano,
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
    const sass = require("gulp-sass");
    const postcss = require("gulp-postcss");
    const beautify = require("gulp-cssbeautify");
    const cssnano = require("cssnano");
    const assets = require("postcss-assets");
    const reporter = require("postcss-reporter");
    const TASK_CONFIG = getConfig();

    return merge(
        TASK_CONFIG.map(task => {
            if (mode.minimize && task.cssnano) {
                task.postcssConfig.push(cssnano(task.cssnano));
            }
            task.postcssConfig.push(reporter);
            const POSTCSS_CONFIG = {
                private: [assets(task.postcssAsset.private)].concat(
                    task.postcssConfig
                ),
                public: [assets(task.postcssAsset.public)].concat(
                    task.postcssConfig
                )
            };

            return merge([
                gulp
                    .src(task.src.private)
                    .pipe(plumber(handleErrors))
                    .pipe(sass(task.sass))
                    .pipe(flatten())
                    .pipe(postcss(POSTCSS_CONFIG.private))
                    .pipe(
                        mode.beautify ? beautify(task.beautifyOptions) : noop()
                    )
                    .pipe(chmod(config.global.chmod))
                    .pipe(plumber.stop())
                    .pipe(gulp.dest(task.dest.private))
                    .pipe(browserSync ? browserSync.stream() : noop())
                    .pipe(sizeOutput(task.key, "CSS", false)),

                gulp
                    .src(task.src.public)
                    .pipe(plumber(handleErrors))
                    .pipe(
                        mode.maps && task.sourceMaps
                            ? sourcemaps.init({ loadMaps: true })
                            : noop()
                    )
                    .pipe(sass(task.sass))
                    .pipe(flatten())
                    .pipe(postcss(POSTCSS_CONFIG.public))
                    .pipe(
                        mode.beautify ? beautify(task.beautifyOptions) : noop()
                    )
                    .pipe(chmod(config.global.chmod))
                    .pipe(pipeBanner(task))
                    .pipe(
                        mode.maps && task.sourceMaps
                            ? sourcemaps.write("")
                            : noop()
                    )
                    .pipe(plumber.stop())
                    .pipe(gulp.dest(task.dest.public))
                    .pipe(browserSync ? browserSync.stream() : noop())
                    .pipe(sizeOutput(task.key, "CSS"))
            ]);
        })
    );
}

module.exports = exportTask("css", getTask);

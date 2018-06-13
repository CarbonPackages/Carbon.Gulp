function getConfig() {
    const sassTildeImporter = require("node-sass-tilde-importer");
    const POSTCSS_PLUGIN = {
        ASSETS: require("postcss-assets"),
        AUTOPREFIXER: require("autoprefixer"),
        CENTER: require("postcss-center"),
        CSS_MQPACKER: require("css-mqpacker"),
        CUSTOM_MEDIA: require("postcss-custom-media"),
        FIXES: require("postcss-fixes"),
        FLEXBOX: require("postcss-flexbox"),
        MAGIC_ANIMATIONS: require("postcss-magic-animations"),
        MEDIA_MINMAX: require("postcss-media-minmax"),
        PLEEEASE_FILTERS: require("pleeease-filters"),
        PSEUDOELEMENTS: require("postcss-pseudoelements"),
        PXTOREM: require("postcss-pxtorem"),
        QUANTITY_QUERIES: require("postcss-quantity-queries"),
        REPORTER: require("postcss-reporter"),
        ROUND_SUBPIXELS: require("postcss-round-subpixels"),
        RTL: require("postcss-rtl"),
        RUCKSACK_CSS: require("rucksack-css"),
        SELECTOR_MATCHES: require("postcss-selector-matches"),
        SELECTOR_NOT: require("postcss-selector-not"),
        SHORT: require("postcss-short"),
        SORT_CSS_MEDIA_QUERIES: require("sort-css-media-queries"),
        VMAX: require("postcss-vmax")
    };
    const TASK_CONFIG = [];
    for (const KEY in config.packages) {
        const CONFIG = config.packages[KEY];
        const CSS_CONFIG = CONFIG.tasks.css;

        if (CSS_CONFIG) {
            // Assets Path
            let assetsPath = path.join(CONFIG.root.base, KEY, CONFIG.root.dest);
            // Dest Path
            let destPath = path.join(
                CONFIG.root.base,
                KEY,
                CONFIG.root.dest,
                CSS_CONFIG.dest
            );

            // Sass Configuration
            let sassConfig = CSS_CONFIG.sass;
            sassConfig.imagePath =
                (CSS_CONFIG.dest ? "../" : "") + sassConfig.imagePath;
            sassConfig.importer = sassTildeImporter;

            // PostCSS Configuration
            const POSTCSS_CONFIGURATION = CSS_CONFIG.postcss;

            let postcssAssetConfig = objectAssignDeep(
                {},
                POSTCSS_CONFIGURATION.assets
            );
            if (Array.isArray(postcssAssetConfig.loadPaths)) {
                postcssAssetConfig.loadPaths = postcssAssetConfig.loadPaths.map(
                    value => path.join(assetsPath, value)
                );
            } else {
                postcssAssetConfig.loadPaths = path.join(
                    assetsPath,
                    postcssAssetConfig.loadPaths
                );
            }
            postcssAssetConfig.relative = destPath;

            let postcssConfig = [
                POSTCSS_PLUGIN.ASSETS(postcssAssetConfig),
                POSTCSS_PLUGIN.MAGIC_ANIMATIONS(
                    POSTCSS_CONFIGURATION.magicAnimations
                ),
                POSTCSS_PLUGIN.VMAX,
                POSTCSS_PLUGIN.SHORT(POSTCSS_CONFIGURATION.short),
                POSTCSS_PLUGIN.CENTER,
                POSTCSS_PLUGIN.RUCKSACK_CSS(POSTCSS_CONFIGURATION.rucksack),
                POSTCSS_PLUGIN.FLEXBOX,
                POSTCSS_PLUGIN.PLEEEASE_FILTERS,
                POSTCSS_PLUGIN.SELECTOR_MATCHES,
                POSTCSS_PLUGIN.SELECTOR_NOT,
                POSTCSS_PLUGIN.PSEUDOELEMENTS(
                    POSTCSS_CONFIGURATION.pseudoelements
                ),
                POSTCSS_PLUGIN.CUSTOM_MEDIA,
                POSTCSS_PLUGIN.MEDIA_MINMAX,
                POSTCSS_PLUGIN.QUANTITY_QUERIES,
                POSTCSS_PLUGIN.FIXES(POSTCSS_CONFIGURATION.fixes),
                POSTCSS_PLUGIN.CSS_MQPACKER({
                    sort: POSTCSS_CONFIGURATION.mqpacker.sort
                        ? POSTCSS_PLUGIN.SORT_CSS_MEDIA_QUERIES
                        : false
                }),
                POSTCSS_PLUGIN.ROUND_SUBPIXELS,
                POSTCSS_PLUGIN.REPORTER
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
                assets: assetsPath,
                sass: sassConfig,
                postcssConfig: postcssConfig,
                cssnano: POSTCSS_CONFIGURATION.cssnano,
                src: path.join(
                    CONFIG.root.base,
                    KEY,
                    CONFIG.root.src,
                    CSS_CONFIG.src,
                    getFiles(CSS_CONFIG.file) ||
                        getExtensions(CSS_CONFIG.extensions)
                ),
                dest: destPath,
                inlinePath: CONFIG.root.inlineAssets
                    ? path.join(
                          CONFIG.root.base,
                          KEY,
                          CONFIG.root.src,
                          CONFIG.root.inlinePath
                      )
                    : false,
                beautifyOptions: CSS_CONFIG.cssbeautifyOptions
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
    const TASK_CONFIG = getConfig();

    return merge(
        TASK_CONFIG.map(task => {
            return gulp
                .src(task.src)
                .pipe(plumber(handleErrors))
                .pipe(mode.maps ? sourcemaps.init({ loadMaps: true }) : noop())
                .pipe(sass(task.sass))
                .pipe(flatten())
                .pipe(postcss(task.postcssConfig))
                .pipe(
                    mode.minimize && task.cssnano
                        ? postcss([cssnano(task.cssnano)])
                        : noop()
                )
                .pipe(mode.beautify ? beautify(task.beautifyOptions) : noop())
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
                .pipe(browserSync ? browserSync.stream() : noop())
                .pipe(sizeOutput(task.key, "CSS"));
        })
    );
}

module.exports = exportTask("css", getTask);

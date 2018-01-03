"use strict";

if (!config.tasks.css) {
    return false;
}

const SASS = require("gulp-sass");
const POSTCSS = require("gulp-postcss");
const BEAUTIFY = require("gulp-cssbeautify");

const POSTCSS_PLUGIN = {
    ASSETS: require("postcss-assets"),
    AUTOPREFIXER: require("autoprefixer"),
    CENTER: require("postcss-center"),
    CSS_MQPACKER: require("css-mqpacker"),
    CSSNANO: require("cssnano"),
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

const PACKAGES_CONFIG = [];

for (let key in config.packages) {
    const CONFIG = config.packages[key];
    const CSS_CONFIG = CONFIG.tasks.css;

    if (CSS_CONFIG) {
        // Assets Path
        let assetsPath = path.join(CONFIG.root.base, key, CONFIG.root.dest);
        // Dest Path
        let destPath = path.join(
            CONFIG.root.base,
            key,
            CONFIG.root.dest,
            CSS_CONFIG.dest
        );

        // Saas Configuration
        let saasConfig = CSS_CONFIG.sass;
        saasConfig.imagePath =
            (CSS_CONFIG.dest ? "../" : "") + saasConfig.imagePath;

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
            POSTCSS_PLUGIN.SHORT,
            POSTCSS_PLUGIN.CENTER,
            POSTCSS_PLUGIN.RUCKSACK_CSS(POSTCSS_CONFIGURATION.rucksack),
            POSTCSS_PLUGIN.FLEXBOX,
            POSTCSS_PLUGIN.PLEEEASE_FILTERS,
            POSTCSS_PLUGIN.SELECTOR_MATCHES,
            POSTCSS_PLUGIN.SELECTOR_NOT,
            POSTCSS_PLUGIN.PSEUDOELEMENTS(POSTCSS_CONFIGURATION.pseudoelements),
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
            postcssConfig.push(POSTCSS_PLUGIN.PXTOREM(POSTCSS_CONFIGURATION.pxtorem));
        }

        if (POSTCSS_CONFIGURATION.autoprefixer) {
            postcssConfig.push(
                POSTCSS_PLUGIN.AUTOPREFIXER(POSTCSS_CONFIGURATION.autoprefixer)
            );
        }

        PACKAGES_CONFIG.push({
            key: key,
            info: CONFIG.info,
            assets: assetsPath,
            saas: saasConfig,
            postcssConfig: postcssConfig,
            cssnano: POSTCSS_CONFIGURATION.cssnano,
            src: path.join(
                CONFIG.root.base,
                key,
                CONFIG.root.src,
                CSS_CONFIG.src,
                CSS_CONFIG.file || getExtensions(CSS_CONFIG.extensions)
            ),
            dest: destPath,
            inlinePath: CONFIG.root.inlineAssets
                ? path.join(
                      CONFIG.root.base,
                      key,
                      CONFIG.root.src,
                      CONFIG.root.inlinePath
                  )
                : false,
            beautifyOptions: CSS_CONFIG.cssbeautifyOptions
        });
    }
}

function css() {
    let tasks = PACKAGES_CONFIG.map(packageConfig => {
        return gulp
            .src(packageConfig.src, {
                since: cache.lastMtime("css")
            })
            .pipe(plumber(handleErrors))
            .pipe(mode.maps ? sourcemaps.init({ loadMaps: true }) : noop())
            .pipe(SASS(packageConfig.saas))
            .pipe(flatten())
            .pipe(POSTCSS(packageConfig.postcssConfig))
            .pipe(
                mode.minimize && packageConfig.cssnano
                    ? POSTCSS([POSTCSS_PLUGIN.CSSNANO(packageConfig.cssnano)])
                    : noop()
            )
            .pipe(
                mode.beautify ? BEAUTIFY(packageConfig.beautifyOptions) : noop()
            )
            .pipe(chmod(config.global.chmod))
            .pipe(
                packageConfig.inlinePath
                    ? gulp.dest(packageConfig.inlinePath)
                    : noop()
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
                    : noop()
            )
            .pipe(mode.maps ? sourcemaps.write("") : noop())
            .pipe(gulp.dest(packageConfig.dest))
            .pipe(browserSync ? browserSync.stream() : noop())
            .pipe(
                size({
                    title: `${packageConfig.key} CSS:`,
                    showFiles: true
                })
            );
    });

    return merge(tasks);
}

module.exports = css;

"use strict";

if (!config.tasks.css) {
    return false;
}

const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const beautify = require("gulp-cssbeautify");

const POSTCSS_PLUGIN = {
    ASSETS: require("postcss-assets"),
    AUTOPREFIXER: require("autoprefixer"),
    CENTER: require("postcss-center"),
    CSS_MQPACKER: require("css-mqpacker"),
    CSSNANO: require("cssnano"),
    CUSTOM_MEDIA: require("postcss-custom-media"),
    FIXES: require("postcss-fixes"),
    FLEXBOX: require("postcss-flexbox"),
    FONT_AWESOME: require("postcss-font-awesome"),
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
            CSS_CONFIG.postcss.assets
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

        let postcss = [
            POSTCSS_PLUGIN.ASSETS(postcssAssetConfig),
            POSTCSS_PLUGIN.MAGIC_ANIMATIONS(CSS_CONFIG.postcss.magicAnimations),
            POSTCSS_PLUGIN.VMAX,
            POSTCSS_PLUGIN.SHORT,
            POSTCSS_PLUGIN.CENTER,
            POSTCSS_PLUGIN.RUCKSACK_CSS(CSS_CONFIG.postcss.rucksack),
            POSTCSS_PLUGIN.FLEXBOX,
            POSTCSS_PLUGIN.PLEEEASE_FILTERS,
            POSTCSS_PLUGIN.SELECTOR_MATCHES,
            POSTCSS_PLUGIN.SELECTOR_NOT,
            POSTCSS_PLUGIN.PSEUDOELEMENTS(CSS_CONFIG.postcss.pseudoelements),
            POSTCSS_PLUGIN.FONT_AWESOME,
            POSTCSS_PLUGIN.CUSTOM_MEDIA,
            POSTCSS_PLUGIN.MEDIA_MINMAX,
            POSTCSS_PLUGIN.QUANTITY_QUERIES,
            POSTCSS_PLUGIN.FIXES(CSS_CONFIG.postcss.fixes),
            POSTCSS_PLUGIN.CSS_MQPACKER({
                sort: CSS_CONFIG.postcss.mqpacker.sort
                    ? POSTCSS_PLUGIN.SORT_CSS_MEDIA_QUERIES
                    : false
            }),
            POSTCSS_PLUGIN.ROUND_SUBPIXELS,
            POSTCSS_PLUGIN.REPORTER
        ];

        if (CSS_CONFIG.postcss.activateRtlCss) {
            postcss.unshift(POSTCSS_PLUGIN.RTL);
        }

        if (CSS_CONFIG.postcss.pxtorem) {
            postcss.push(POSTCSS_PLUGIN.PXTOREM(CSS_CONFIG.postcss.pxtorem));
        }

        if (CSS_CONFIG.postcss.autoprefixer) {
            postcss.push(
                POSTCSS_PLUGIN.AUTOPREFIXER(CSS_CONFIG.postcss.autoprefixer)
            );
        }

        PACKAGES_CONFIG.push({
            key: key,
            info: CONFIG.info,
            assets: assetsPath,
            saas: saasConfig,
            postcss: postcss,
            cssnano: CSS_CONFIG.postcss.cssnano,
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
            .pipe(mode.maps ? sourcemaps.init({ loadMaps: true }) : util.noop())
            .pipe(sass(packageConfig.saas))
            .pipe(flatten())
            .pipe(postcss(packageConfig.postcss))
            .pipe(
                mode.minimize && packageConfig.cssnano
                    ? postcss([POSTCSS_PLUGIN.CSSNANO(packageConfig.cssnano)])
                    : util.noop()
            )
            .pipe(
                mode.beautify
                    ? beautify(packageConfig.beautifyOptions)
                    : util.noop()
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
                    title: `${packageConfig.key} CSS:`,
                    showFiles: true
                })
            );
    });

    return merge(tasks);
}

module.exports = css;

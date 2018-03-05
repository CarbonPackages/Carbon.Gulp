"use strict";

if (
    !config.tasks.optimizeSvg ||
    (config.tasks.optimizeSvg != "src" && config.tasks.optimizeSvg != "dest")
) {
    return false;
}

const PACKAGES_CONFIG = [];
for (let key in config.packages) {
    const CONFIG = config.packages[key];
    const CONFIG_OPTIMIZE_SVG = CONFIG.tasks.optimizeSvg;

    if (
        CONFIG_OPTIMIZE_SVG &&
        (CONFIG_OPTIMIZE_SVG == "src" || CONFIG_OPTIMIZE_SVG == "dest")
    ) {
        let configuration = {
            key: key ? key : CONFIG.info.package ? CONFIG.info.package : false,
            src: [
                path.join(
                    CONFIG.root.base,
                    key,
                    CONFIG.root[CONFIG_OPTIMIZE_SVG],
                    "**/*.svg"
                )
            ],
            dest: path.join(
                CONFIG.root.base,
                key,
                CONFIG.root[CONFIG_OPTIMIZE_SVG]
            ),
            pretty: CONFIG_OPTIMIZE_SVG == "src" ? true : false
        };

        // we don't want the Sprite to be optimized
        if (CONFIG.tasks.svgSprite) {
            configuration.src.push(
                path.join(
                    "!" + CONFIG.root.base,
                    CONFIG.root.dest,
                    CONFIG.tasks.svgSprite.dest,
                    CONFIG.tasks.svgSprite.src + ".svg"
                )
            );
            configuration.src.push(
                path.join(
                    "!" + CONFIG.root.base,
                    CONFIG.root.src,
                    CONFIG.root.inlinePath,
                    CONFIG.tasks.svgSprite.src + ".svg"
                )
            );
        }

        PACKAGES_CONFIG.push(configuration);
    }
}

const SVGMIN = require("gulp-svgmin");
const PRETTY_OPTIONS = {
    js2svg: {
        pretty: true
    }
};

function optimize() {
    let tasks = PACKAGES_CONFIG.map(packageConfig => {
        return gulp
            .src(packageConfig.src)
            .pipe(plumber(handleErrors))
            .pipe(packageConfig.pretty ? SVGMIN(PRETTY_OPTIONS) : SVGMIN())
            .pipe(chmod(config.global.chmod))
            .pipe(plumber.stop())
            .pipe(gulp.dest(packageConfig.dest))
            .pipe(
                size({
                    title: `${packageConfig.key} Optimize SVG Images:`,
                    showFiles: true
                })
            );
    });

    return merge(tasks);
}

module.exports = optimize;

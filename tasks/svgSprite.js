"use strict";

if (!config.tasks.svgSprite) {
    return false;
}

const SVGSTORE = require("gulp-svgstore");
const PACKAGES_CONFIG = [];
for (let key in config.packages) {
    const CONFIG = config.packages[key];
    const SPRITE_CONFIG = CONFIG.tasks.svgSprite;

    if (SPRITE_CONFIG) {
        PACKAGES_CONFIG.push({
            key: key,
            src: path.join(
                CONFIG.root.base,
                key,
                CONFIG.root.src,
                SPRITE_CONFIG.src,
                getExtensions(SPRITE_CONFIG.extensions)
            ),
            dest: path.join(
                CONFIG.root.base,
                key,
                CONFIG.root.dest,
                SPRITE_CONFIG.dest
            ),
            inlinePath: CONFIG.root.inlineAssets
                ? path.join(
                      CONFIG.root.base,
                      key,
                      CONFIG.root.src,
                      CONFIG.root.inlinePath
                  )
                : false,
            svgo: SPRITE_CONFIG.svgo
        });
    }
}

function svgSprite() {
    let tasks = PACKAGES_CONFIG.map(packageConfig => {
        return gulp
            .src(packageConfig.src, {
                since: cache.lastMtime(`${packageConfig.key}.svgSprite`)
            })
            .pipe(plumber(handleErrors))
            .pipe(
                rename(path => {
                    path.basename = "icon-" + path.basename.toLowerCase();
                })
            )
            .pipe(cache(`${packageConfig.key}.svgSprite`))
            .pipe(imagemin([imagemin.svgo({ plugins: [packageConfig.svgo] })]))
            .pipe(SVGSTORE())
            .pipe(chmod(config.global.chmod))
            .pipe(
                packageConfig.inlinePath
                    ? gulp.dest(packageConfig.inlinePath)
                    : util.noop()
            )
            .pipe(gulp.dest(packageConfig.dest))
            .pipe(
                size({
                    title: `${packageConfig.key} SVG:`,
                    showFiles: true
                })
            );
    });
    return merge(tasks);
}

module.exports = svgSprite;

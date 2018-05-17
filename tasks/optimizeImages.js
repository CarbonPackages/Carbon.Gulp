"use strict";

if (!config.tasks.images) {
    return false;
}

const PACKAGES_CONFIG = [];
for (const KEY in config.packages) {
    const CONFIG = config.packages[KEY];
    const IMAGES_CONFIG = CONFIG.tasks.images;
    const IMAGEMIN_CONFIG = {
        gifsicle: {},
        jpegtran: {},
        optipng: {},
        svgo: {}
    };
    try {
        IMAGEMIN_CONFIG.gifsicle = CONFIG.tasks.css.postcss.imagemin.gifsicle;
    } catch (error) {}
    try {
        IMAGEMIN_CONFIG.jpegtran = CONFIG.tasks.css.postcss.imagemin.jpegtran;
    } catch (error) {}
    try {
        IMAGEMIN_CONFIG.optipng = CONFIG.tasks.css.postcss.imagemin.optipng;
    } catch (error) {}
    try {
        IMAGEMIN_CONFIG.svgo = CONFIG.tasks.css.postcss.imagemin.svgo;
    } catch (error) {}

    if (IMAGES_CONFIG) {
        PACKAGES_CONFIG.push({
            imagemin: IMAGEMIN_CONFIG,
            key: KEY ? KEY : CONFIG.info.package ? CONFIG.info.package : false,
            src: path.join(
                CONFIG.root.base,
                KEY,
                CONFIG.root.src,
                IMAGES_CONFIG.src,
                "/**",
                getExtensions(IMAGES_CONFIG.extensions)
            ),
            dest: path.join(
                CONFIG.root.base,
                KEY,
                CONFIG.root.dest,
                IMAGES_CONFIG.dest
            )
        });
    }
}

function optimizeImages() {
    let tasks = PACKAGES_CONFIG.map(packageConfig => {
        return gulp
            .src(packageConfig.src)
            .pipe(plumber(handleErrors))
            .pipe(
                imagemin(
                    [
                        imagemin.gifsicle(packageConfig.imagemin.gifsicle),
                        imagemin.jpegtran(packageConfig.imagemin.jpegtran),
                        imagemin.optipng(packageConfig.imagemin.optipng),
                        imagemin.svgo(packageConfig.imagemin.svgo)
                    ],
                    {
                        verbose: true
                    }
                )
            )
            .pipe(chmod(config.global.chmod))
            .pipe(plumber.stop())
            .pipe(gulp.dest(packageConfig.dest))
            .pipe(
                size({
                    title: `${
                        packageConfig.key ? `${packageConfig.key} ` : ""
                    }Images:`,
                    showFiles: false
                })
            );
    });
    return merge(tasks);
}

module.exports = optimizeImages;

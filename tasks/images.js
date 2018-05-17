"use strict";

if (!config.tasks.images) {
    return false;
}

const PACKAGES_CONFIG = [];
for (const KEY in config.packages) {
    const CONFIG = config.packages[KEY];
    const IMAGES_CONFIG = CONFIG.tasks.images;

    if (IMAGES_CONFIG) {
        PACKAGES_CONFIG.push({
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

function images() {
    let tasks = PACKAGES_CONFIG.map(packageConfig => {
        return gulp
            .src(packageConfig.src, {
                since: cache.lastMtime("images")
            })
            .pipe(plumber(handleErrors))
            .pipe(cache("images"))
            .pipe(changed(packageConfig.dest)) // Ignore unchanged files
            .pipe(flatten())
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

module.exports = images;

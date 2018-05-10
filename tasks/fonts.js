"use strict";

if (!config.tasks.fonts) {
    return false;
}

const PACKAGES_CONFIG = [];
for (const KEY in config.packages) {
    const CONFIG = config.packages[KEY];
    const FONTS_CONFIG = CONFIG.tasks.fonts;

    if (FONTS_CONFIG) {
        PACKAGES_CONFIG.push({
            key: KEY ? KEY : CONFIG.info.package ? CONFIG.info.package : false,
            src: path.join(
                CONFIG.root.base,
                KEY,
                CONFIG.root.src,
                FONTS_CONFIG.src,
                "/**",
                getExtensions(FONTS_CONFIG.extensions)
            ),
            dest: path.join(
                CONFIG.root.base,
                KEY,
                CONFIG.root.dest,
                FONTS_CONFIG.dest
            )
        });
    }
}

function fonts() {
    let tasks = PACKAGES_CONFIG.map(packageConfig => {
        return gulp
            .src(packageConfig.src, {
                since: cache.lastMtime("fonts")
            })
            .pipe(plumber(handleErrors))
            .pipe(cache("fonts"))
            .pipe(changed(packageConfig.dest)) // Ignore unchanged files
            .pipe(flatten())
            .pipe(chmod(config.global.chmod))
            .pipe(plumber.stop())
            .pipe(gulp.dest(packageConfig.dest))
            .pipe(
                size({
                    title: `${packageConfig.key} Fonts:`,
                    showFiles: false
                })
            );
    });
    return merge(tasks);
}

module.exports = fonts;

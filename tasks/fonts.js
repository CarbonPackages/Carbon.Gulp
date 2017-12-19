"use strict";

if (!config.tasks.fonts) {
    return false;
}

const PACKAGES_CONFIG = [];
for (let key in config.packages) {
    const CONFIG = config.packages[key];
    const FONTS_CONFIG = CONFIG.tasks.fonts;

    if (FONTS_CONFIG) {
        PACKAGES_CONFIG.push({
            key: key,
            src: path.join(
                CONFIG.root.base,
                key,
                CONFIG.root.src,
                FONTS_CONFIG.src,
                "/**",
                getExtensions(FONTS_CONFIG.extensions)
            ),
            dest: path.join(CONFIG.root.base, key, CONFIG.root.dest, FONTS_CONFIG.dest)
        });
    }
}

function fonts() {
    let tasks = PACKAGES_CONFIG.map(packageConfig => {
        return gulp.src(packageConfig.src, { since: cache.lastMtime(`${packageConfig.key}.fonts`)})
            .pipe(plumber(handleErrors))
            .pipe(cache(`${packageConfig.key}.fonts`))
            .pipe(changed(packageConfig.dest)) // Ignore unchanged files
            .pipe(flatten())
            .pipe(chmod(config.global.chmod))
            .pipe(gulp.dest(packageConfig.dest))
            .pipe(
                size({
                    title: `${packageConfig.key} Fonts: `,
                    showFiles: false
                })
            );
    });
    return merge(tasks);
}

module.exports = fonts;

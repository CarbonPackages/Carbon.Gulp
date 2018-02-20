"use strict";

if (!config.tasks.static) {
    return false;
}

const PACKAGES_CONFIG = [];
for (let key in config.packages) {
    const CONFIG = config.packages[key];
    const STATIC_CONFIG = CONFIG.tasks.static;

    if (STATIC_CONFIG) {
        PACKAGES_CONFIG.push({
            key: key ? key : CONFIG.info.package ? CONFIG.info.package : false,
            src: path.join(
                CONFIG.root.base,
                key,
                CONFIG.root.src,
                STATIC_CONFIG.src,
                "/**",
                getExtensions(STATIC_CONFIG.extensions)
            ),
            dest: path.join(
                CONFIG.root.base,
                key,
                CONFIG.root.dest,
                STATIC_CONFIG.dest
            )
        });
    }
}

function copy() {
    let tasks = PACKAGES_CONFIG.map(packageConfig => {
        return gulp
            .src(packageConfig.src, {
                since: cache.lastMtime("static")
            })
            .pipe(plumber(handleErrors))
            .pipe(cache("static"))
            .pipe(changed(packageConfig.dest)) // Ignore unchanged files
            .pipe(chmod(config.global.chmod))
            .pipe(gulp.dest(packageConfig.dest))
            .pipe(
                size({
                    title: `${packageConfig.key} Static Files:`,
                    showFiles: false
                })
            );
    });
    return merge(tasks);
}

module.exports = copy;

"use strict";

if (
    !config.tasks.optimizeSvg ||
    !config.tasks.svgSprite ||
    (config.tasks.optimizeSvg != "src" && config.tasks.optimizeSvg != "dest")
) {
    return false;
}

let paths = {
    src: [
        path.join(
            config.root.base,
            config.root[config.tasks.optimizeSvg],
            "**/*.svg"
        ),
        // we don't want the Sprite to be optimized
        path.join(
            "!" + config.root.base,
            config.root.dest,
            config.tasks.svgSprite.dest,
            config.tasks.svgSprite.src + ".svg"
        ),
        path.join(
            "!" + config.root.base,
            config.root.src,
            config.root.inlinePath,
            config.tasks.svgSprite.src + ".svg"
        )
    ],
    dest: path.join(config.root.base, config.root[config.tasks.optimizeSvg])
};

const svgmin = require("gulp-svgmin");
const prettyOptions = {
    js2svg: {
        pretty: true
    }
};
const pretty = config.tasks.optimizeSvg == "src" ? true : false;

function optimizeSvg() {
    return gulp
        .src(paths.src)
        .pipe(plumber(handleErrors))
        .pipe(pretty ? svgmin(prettyOptions) : svgmin())
        .pipe(chmod(config.chmod))
        .pipe(gulp.dest(paths.dest))
        .pipe(
            size({
                title: "Optimize SVG Images:",
                showFiles: true
            })
        );
}

module.exports = optimizeSvg;

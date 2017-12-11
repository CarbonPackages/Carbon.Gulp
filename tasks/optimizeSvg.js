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
        )
    ],
    dest: path.join(config.root.base, config.root[config.tasks.optimizeSvg])
};

const beautify = require("gulp-html-beautify");
const options = {
    indentSize: 4,
    useConfig: false,
    end_with_newline: true
};
const pretty = !!config.tasks.optimizeSvg == "src";

function optimizeSvg() {
    return gulp
        .src(paths.src)
        .pipe(plumber(handleErrors))
        .pipe(
            imagemin(
                [
                    imagemin.svgo({
                        js2svg: {
                            pretty: pretty
                        }
                    })
                ],
                {
                    verbose: true
                }
            )
        )
        .pipe(pretty ? beautify(options) : util.noop())
        .pipe(chmod(config.chmod))
        .pipe(gulp.dest(paths.dest))
        .pipe(
            size({
                title: "Optimize SVG Images:",
                showFiles: false
            })
        );
}

module.exports = optimizeSvg;

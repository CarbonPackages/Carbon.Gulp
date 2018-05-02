"use strict";
const FUNCTIONS = require("../functions");

let task = {
    noop: callback => {
        callback();
    },
    timeout: callback => {
        setTimeout(() => {
            callback();
        }, 10);
    }
};

for (let taskName of [
    "clean",
    "compressBrotli",
    "compressZopfli",
    "css",
    "fonts",
    "images",
    "js",
    "jsLint",
    "optimizeImages",
    "optimizeSvg",
    "scssLint",
    "showConfig",
    "static",
    "svgSprite"
]) {
    let func = require("./" + taskName);
    if (typeof func !== "function") {
        func = task.noop;
    }
    task[taskName] = func;
}

for (let taskWithTimeout of ["scss"]) {
    let func = require("./" + taskWithTimeout);
    if (typeof func !== "function") {
        task[taskWithTimeout] = task.noop;
    } else {
        task[taskWithTimeout] = bach.series(func, task.timeout);
    }
}

task.info = callback => {
    let content = [];

    if (config.info.homepage) {
        content.push(["  Homepage", ":", config.info.homepage]);
    }
    if (config.info.author) {
        content.push(["  Author", ":", config.info.author]);
    }

    if (content.length) {
        let table = textTable(content, { align: ["r", "c", "l"] });
        log(`\n\n${colors.dim(table)}\n\n`);
    }
    callback();
};

gulp.task("showConfig", task.showConfig);
gulp.task("showConfig").description = "Show the merged configuration";
gulp.task("showConfig").flags = {
    "--p, --path": ` Pass path from the json file to reduce output. Slash ("/") seperated`
};

if (config.tasks.css) {
    gulp.task("css", bach.series(task.scss, task.css));
    gulp.task("css").description = "Render CSS Files";
    gulp.task("css").flags = flags;

    gulp.task("scss", task.scss);
    gulp.task("scss").description =
        "Render _all.scss, _allsub.scss and _allFusion.scss Files";
}

if (config.tasks.js) {
    gulp.task("js", bach.parallel(task.js, task.jsLint));
    gulp.task("js").description = "Render Javascript Files";
    gulp.task("js").flags = flags;
}

if (config.tasks.scssLint || config.tasks.jsLint) {
    if (config.tasks.scssLint && config.tasks.jsLint) {
        gulp.task("lint", bach.parallel(task.scssLint, task.jsLint));
        gulp.task("lint").description = "Lint Javascript and CSS files";
    } else if (config.tasks.scssLint) {
        gulp.task("lint", task.scssLint);
        gulp.task("lint").description = "Lint CSS files";
    } else {
        gulp.task("lint", task.jsLint);
        gulp.task("lint").description = "Lint Javascript files";
    }
}

if (config.tasks.images) {
    gulp.task("optimizeImages", task.optimizeImages);
    gulp.task("optimizeImages").description =
        "Optimize images and overwrite them in the public folder";
}

if (config.tasks.svgSprite) {
    gulp.task("sprite", task.svgSprite);
    gulp.task("sprite").description = "Create SVG Sprite";
}

if (config.tasks.optimizeSvg) {
    gulp.task("optimizeSvg", task.optimizeSvg);
    gulp.task("optimizeSvg").description = "Optimize SVGs and overwrite them";
}

if (config.tasks.compress) {
    gulp.task(
        "compress",
        bach.parallel(task.compressBrotli, task.compressZopfli)
    );
    gulp.task("compress").description =
        "Compress all CSS/JS/SVG with Brotli and Zopfli";
} else {
    gulp.task("compress", callback => {
        log(
            colors.red(
                "\n\nIf you want to use compress, you have to enable it in the configuration.\n"
            )
        );
        callback();
    });
    gulp.task("compress").description =
        "If you want to use compress, you have to enable it in the configuration";
}

// Build Task
gulp.task(
    "build",
    bach.series(
        task.clean,
        task.info,
        bach.parallel(
            task.scss,
            task.scssLint,
            task.jsLint,
            task.fonts,
            task.images,
            task.static,
            task.svgSprite
        ),
        bach.parallel(task.css, task.js)
    )
);
gulp.task("build").description =
    colors.inverse(" Generates all ") + " Assets, Javascript and CSS files";
gulp.task("build").flags = flags;

task.reload = function(done) {
    if (browserSync) {
        browserSync.reload();
    }
    done();
};

// Watch
task.watch = () => {
    const TASK = ["css", "js", "fonts", "images", "static", "svgSprite"];

    if (browserSync) {
        browserSync.init(config.global.browserSync);
    }

    TASK.forEach(taskName => {
        if (config.tasks[taskName]) {
            const FILES_TO_WATCH = FUNCTIONS.getFilesToWatch(taskName);
            switch (taskName) {
                case "css":
                    gulp
                        .watch(
                            FILES_TO_WATCH,
                            bach.parallel(task.css, task.scssLint)
                        )
                        .on("change", cache.update(taskName));
                    break;
                case "js":
                    gulp
                        .watch(
                            FILES_TO_WATCH,
                            bach.parallel(
                                bach.series(task.js, task.reload),
                                task.jsLint
                            )
                        )
                        .on("change", cache.update(taskName));
                    break;
                default:
                    gulp
                        .watch(FILES_TO_WATCH, task[taskName])
                        .on("change", cache.update(taskName));
            }
        }
    });

    log(colors.dim("\n\n     Watching source files for changes\n\n"));
};

gulp.task("watch", task.watch);
gulp.task("watch").description = "Watch files and regenereate them";

// Default Task
gulp.task("default", gulp.series("build", "watch"));
gulp.task("default").description =
    colors.inverse(" Generates all ") +
    " Assets, Javascript and CSS files & " +
    colors.inverse(" watch them ");
gulp.task("default").flags = flags;

function setPipelineEnvironment(callback) {
    global.mode.pipeline = true;
    callback();
}

if (config.tasks.pipeline && typeof config.tasks.pipeline == "object") {
    let series = gulp.series(setPipelineEnvironment, config.tasks.pipeline);
    gulp.task("pipeline", series);
    gulp.task("pipeline").description = "Make files production ready";
}

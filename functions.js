"use strict";

function getTimestamp() {
    let timestamp;
    let now = new Date();
    timestamp = now.getFullYear().toString();
    timestamp += "-";
    timestamp +=
        (now.getMonth() < 9 ? "0" : "") + (now.getMonth() + 1).toString();
    timestamp += "-";
    timestamp += (now.getDate() < 10 ? "0" : "") + now.getDate().toString();
    timestamp += " ";
    timestamp += (now.getHours() < 10 ? "0" : "") + now.getHours().toString();
    timestamp += ":";
    timestamp +=
        (now.getMinutes() < 10 ? "0" : "") + now.getMinutes().toString();
    //timestamp += ':';
    //timestamp += (now.getSeconds() < 10 ? '0' : '') + now.getSeconds().toString();
    return timestamp;
}

function getExtensions(extensions, prepend = "") {
    if (Array.isArray(extensions)) {
        return (
            "/" +
            prepend +
            "*." +
            (extensions.length > 1
                ? "{" + extensions.join(",") + "}"
                : extensions)
        );
    } else {
        return "/" + prepend + "*." + extensions;
    }
}

function getInfoFromComposer(path = "") {
    try {
        let composer = require(`../../${path}composer.json`);

        config.info.author = composer.author
            ? composer.author
            : config.info.author;
        config.info.homepage = composer.homepage
            ? composer.homepage
            : config.info.homepage;
    } catch (error) {}
}

function mergeRootConfig(filename) {
    try {
        const configFromRoot = require(`../../${filename}`);
        objectAssignDeep(config, configFromRoot);
        console.info(
            `Loaded config file ${util.colors.red(filename)} from root`
        );
    } catch (error) {}
}

function getFolderSiteName(files) {
    for (let i = 0; i < files.length; i++) {
        if (!files[i].startsWith(".") && !files[i].startsWith("_")) {
            return files[i];
        }
    }
    return false;
}

function mergePackageConfig(path) {
    let gulpJsonFiles = {};
    fs.readdirSync(path).forEach(folder => {
        if (!folder.startsWith(".") && !folder.startsWith("_")) {
            const GULP_JSON_PATH = `${path}/${folder}/Configuration/Gulp.json`;

            if (fs.existsSync(GULP_JSON_PATH)) {
                gulpJsonFiles[folder] = GULP_JSON_PATH;
            }
        }
    });
    for (let key in gulpJsonFiles) {
        if (gulpJsonFiles.hasOwnProperty(key)) {
            try {
                const CONFIG = {
                    DEFAULT: {
                        info: config.info ? config.info : false,
                        root: config.root ? config.root : false,
                        tasks: config.tasks ? config.tasks : false
                    },
                    PACKAGE: config.packages[key] || {},
                    JSON: require(`../../${gulpJsonFiles[key]}`)
                };

                config.packages[key] = objectAssignDeep(
                    {},
                    CONFIG.DEFAULT,
                    CONFIG.PACKAGE,
                    CONFIG.JSON
                );

                console.info(
                    `Loaded config file ${colors.red(
                        "Gulp.json"
                    )} from the package ${colors.red(key)}`
                );
            } catch (error) {
                handleErrors({
                    name: key,
                    plugin: "Error in merging configuration",
                    message: "There is an error in the Gulp.json file"
                });
            }
        }
    }
}

function loadTasks() {
    require("./tasks");
}

function mergeConfigAndLoadTasks() {
    getInfoFromComposer();

    mergeRootConfig("gulp_global.json");
    mergeRootConfig("gulp_local.json");

    if (
        config.global &&
        config.global.mergeConfigFromPackages &&
        config.global.mergeConfigFromPackages.length
    ) {
        config.global.mergeConfigFromPackages.forEach(folder => {
            mergePackageConfig(folder);
        });
    }

    if (config.global.browserSync.proxyRootFolder) {
        let prepend =
            typeof config.global.browserSync.proxyRootFolder == "string"
                ? config.global.browserSync.proxyRootFolder
                : "";
        config.global.browserSync.proxy =
            prepend + path.basename(path.join(__dirname, "../.."));
    }

    if (config.global.browserSync.enable) {
        delete config.global.browserSync.enable;
        browserSync = require("browser-sync").create();
    }

    loadTasks();
}

function shureArray(input) {
    let array = input;
    // Make shure it's an array
    if (typeof input === "string") {
        array = [input];
    }
    return array;
}

function getFilesToWatch(taskName, configuration = config, key = "**") {
    let conf = configuration.tasks[taskName];
    let watchConfig = shureArray(configuration.root.watch);
    let dontWatch = shureArray(configuration.root.dontWatch);
    let filesToWatch = [];
    if (conf && watchConfig && watchConfig.length) {
        if (conf.watchOnlySrc) {
            filesToWatch.push(
                path.join(
                    configuration.root.base,
                    key,
                    configuration.root.src,
                    conf.src,
                    "/**",
                    getExtensions(conf.extensions)
                )
            );
        } else {
            filesToWatch = watchConfig.map(value =>
                path.join(
                    configuration.root.base,
                    key,
                    value,
                    getExtensions(conf.extensions)
                )
            );
        }

        if (dontWatch && dontWatch.length) {
            dontWatch.forEach(value => {
                if (value) {
                    filesToWatch.push(
                        "!" +
                            path.join(
                                configuration.root.base,
                                key,
                                value,
                                getExtensions(conf.extensions)
                            )
                    );
                }
            });
        }

        if (taskName === "css") {
            watchConfig.forEach(value => {
                filesToWatch.push(
                    "!" +
                        path.join(
                            configuration.root.base,
                            key,
                            value,
                            "**/_{all,allsub}.scss"
                        )
                );
            });
        }
    }
    return filesToWatch;
}

function pluralize(string, count) {
    if (count > 1) {
        string += "s";
    }
    return string;
}

function notifyText(object) {
    if (object.warning || object.error || object.warnings || object.errors) {
        let warning;
        let message = " found";
        let hasError = object.error || object.errors ? true : false;
        let options = {
            title: hasError ? "Error" : "Warning",
            icon: hasError ? gulpIcons.error : gulpIcons.warning,
            wait: hasError,
            sound: hasError ? "Basso" : false
        };

        if (
            object.warning ||
            (object.error && (!object.warnings && !object.errors))
        ) {
            message = "Some issues found";
        }
        if (object.warnings) {
            warning = pluralize(" warning", object.warnings);
            message = object.warnings + warning + message;
        }
        if (object.errors) {
            let error = pluralize(" error", object.warnings);
            message =
                object.errors +
                error +
                (object.warnings ? " and " : "") +
                message;
        }

        if (config.global.notifications) {
            notifier.notify({
                title: options.title,
                subtitle: object.subtitle,
                message: message,
                icon: options.icon,
                wait: options.wait,
                sound: options.sound
            });
        } else {
            // Output an error message in the console
            let text = ` (${object.subtitle}): ${message}`;
            if (hasError) {
                log(colors.red(options.title) + text);
            } else {
                log(colors.yellow(options.title) + text);
            }
        }
    }
}

module.exports = {
    getExtensions: getExtensions,
    getFilesToWatch: getFilesToWatch,
    getTimestamp: getTimestamp,
    mergeConfigAndLoadTasks: mergeConfigAndLoadTasks,
    notifyText: notifyText,
    pluralize: pluralize,
    shureArray: shureArray
};

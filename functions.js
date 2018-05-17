"use strict";

function getTimestamp() {
    let n = new Date();
    let t = n.getFullYear().toString();
    t += "-";
    t += (n.getMonth() < 9 ? "0" : "") + (n.getMonth() + 1).toString();
    t += "-";
    t += (n.getDate() < 10 ? "0" : "") + n.getDate().toString();
    t += " ";
    t += (n.getHours() < 10 ? "0" : "") + n.getHours().toString();
    t += ":";
    t += (n.getMinutes() < 10 ? "0" : "") + n.getMinutes().toString();
    return t;
}

function getExtensions(extensions, excludeUnderscore = true, prepend = "") {
    if (Array.isArray(extensions) && extensions.length > 1) {
        extensions = `{${extensions.join(",")}}`;
    }
    // Exclude files starting with an underscore
    return `/${prepend}${excludeUnderscore ? "[^_]" : ""}*.${extensions}`;
}

function readYaml(path) {
    return yaml.safeLoad(fs.readFileSync(path));
}

function checkTask(...tasks) {
    tasks.forEach(task => {
        if (!config.tasks[task]) {
            return false;
        }
    });
    return true;
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
        const configFromRoot = readYaml(filename);
        if (configFromRoot) {
            objectAssignDeep(config, configFromRoot);
            log(`Loaded config file ${colors.red(filename)} from root`);
        }
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
    let gulpYamlFiles = [];
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(folder => {
            if (!folder.startsWith(".") && !folder.startsWith("_")) {
                const GULP_YAML_PATH = `${path}/${folder}/Configuration/Gulp.yaml`;
                if (fs.existsSync(GULP_YAML_PATH)) {
                    gulpYamlFiles.push({
                        package: folder,
                        base: path,
                        yaml: GULP_YAML_PATH
                    });
                }
            }
        });
    }
    gulpYamlFiles.forEach(file => {
        try {
            const CONFIG = {
                DEFAULT: {
                    info: config.info ? config.info : false,
                    root: config.root ? config.root : false,
                    tasks: config.tasks ? config.tasks : false
                },
                BASE: {
                    root: {
                        base: `./${file.base}/`
                    }
                },
                PACKAGE: config.packages[file.package] || {},
                YAML: readYaml(file.yaml)
            };

            config.packages[file.package] = objectAssignDeep(
                {},
                CONFIG.DEFAULT,
                CONFIG.BASE,
                CONFIG.PACKAGE,
                CONFIG.YAML
            );

            log(
                `Loaded config file ${colors.red(
                    "Gulp.yaml"
                )} from the package ${colors.red(file.package)}`
            );
        } catch (error) {
            handleErrors({
                name: file.package,
                plugin: "Error in merging configuration",
                message: "There is an error in the Gulp.yaml file"
            });
        }
    });
}

function loadTasks() {
    require("./tasks");
}

function mergeConfigAndLoadTasks() {
    getInfoFromComposer();

    mergeRootConfig("gulp_global.yaml");
    mergeRootConfig("gulp_local.yaml");

    if (mode.test) {
        mergeRootConfig("gulp_test.yaml");
    }

    if (
        config.global &&
        config.global.mergeConfigFromPackages &&
        config.global.mergeConfigFromPackages.length
    ) {
        config.global.mergeConfigFromPackages.forEach(folder => {
            mergePackageConfig(folder);
        });
    } else {
        config.packages[""] = objectAssignDeep(
            {},
            {
                info: config.info ? config.info : false,
                root: config.root ? config.root : false,
                tasks: config.tasks ? config.tasks : false
            }
        );
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
    const TASK_CONF = configuration.tasks[taskName];
    const WATCH_CONFIG = shureArray(configuration.root.watch);
    const DONT_WATCH = shureArray(configuration.root.dontWatch);

    let filesToWatch = [];

    if (TASK_CONF && WATCH_CONFIG && WATCH_CONFIG.length) {
        if (TASK_CONF.watchOnlySrc) {
            filesToWatch.push(
                path.join(
                    configuration.root.base,
                    key,
                    configuration.root.src,
                    TASK_CONF.src,
                    "/**",
                    getExtensions(TASK_CONF.extensions, false)
                )
            );
        } else {
            filesToWatch = WATCH_CONFIG.map(value =>
                path.join(
                    configuration.root.base,
                    key,
                    value,
                    getExtensions(TASK_CONF.extensions, false)
                )
            );
        }

        if (DONT_WATCH && DONT_WATCH.length) {
            DONT_WATCH.forEach(value => {
                if (value) {
                    filesToWatch.push(
                        "!" +
                            path.join(
                                configuration.root.base,
                                key,
                                value,
                                getExtensions(TASK_CONF.extensions, false)
                            )
                    );
                }
            });
        }

        if (taskName === "css") {
            WATCH_CONFIG.forEach(value => {
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
            title: object.title ? object.title : hasError ? "Error" : "Warning",
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
            let error = pluralize(" error", object.errors);
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
    readYaml: readYaml,
    getExtensions: getExtensions,
    getFilesToWatch: getFilesToWatch,
    getTimestamp: getTimestamp,
    mergeConfigAndLoadTasks: mergeConfigAndLoadTasks,
    notifyText: notifyText,
    pluralize: pluralize,
    shureArray: shureArray,
    checkTask: checkTask
};

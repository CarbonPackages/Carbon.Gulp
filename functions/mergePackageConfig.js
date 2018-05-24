const readYaml = require("./readYaml");

module.exports = function(path) {
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
};

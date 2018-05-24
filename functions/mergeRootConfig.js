const readYaml = require("./readYaml");

module.exports = function(filename) {
    try {
        const configFromRoot = readYaml(filename);
        if (configFromRoot) {
            objectAssignDeep(config, configFromRoot);
            log(`Loaded config file ${colors.red(filename)} from root`);
        }
    } catch (error) {}
};

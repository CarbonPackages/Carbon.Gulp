module.exports = function(path) {
    return yaml.safeLoad(fs.readFileSync(path));
};

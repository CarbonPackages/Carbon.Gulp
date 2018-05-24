module.exports = function(files) {
    for (let i = 0; i < files.length; i++) {
        if (!files[i].startsWith(".") && !files[i].startsWith("_")) {
            return files[i];
        }
    }
    return false;
};

module.exports = function(files) {
    if (Array.isArray(files)) {
        files = files.length > 1 ? `{${files.join(",")}}` : files[0];
    }
    return files;
};

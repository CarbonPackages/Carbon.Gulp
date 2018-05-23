module.exports = callback => {
    setTimeout(() => {
        callback();
    }, 10);
};

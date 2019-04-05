module.exports = function(input) {
    let array = input;
    // Make shure it's an array
    if (typeof input === 'string') {
        array = [input];
    }
    return array;
};

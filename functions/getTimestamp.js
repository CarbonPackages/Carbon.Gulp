module.exports = function() {
    const NOW = new Date();
    let value = NOW.getFullYear().toString();
    value += "-";
    value += (NOW.getMonth() < 9 ? "0" : "") + (NOW.getMonth() + 1).toString();
    value += "-";
    value += (NOW.getDate() < 10 ? "0" : "") + NOW.getDate().toString();
    value += " ";
    value += (NOW.getHours() < 10 ? "0" : "") + NOW.getHours().toString();
    value += ":";
    value += (NOW.getMinutes() < 10 ? "0" : "") + NOW.getMinutes().toString();
    return value;
};

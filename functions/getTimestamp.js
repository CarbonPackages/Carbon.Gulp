module.exports = function() {
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
};

const DEL = require("del");
const EXPECTED = {
    css: `body{margin-right:10px;margin-left:10px}`,
    js: JSON.stringify([`Hello World`, `Hello Carbon.Gulp`]),
    svg: `<?xml version="1.0" encoding="utf-8"?><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><symbol viewBox="0 0 260 260" id="icon-circle" xmlns="http://www.w3.org/2000/svg"><circle fill="#FFF" cx="130" cy="130" r="130"/></symbol></svg>`
};

let passAllTest = true;

function readFileAsync(file) {
    return new Promise((resolve, reject) => {
        fs.readFile(file, "utf8", (error, data) => {
            let key = path.extname(file).substring(1);
            if (error) {
                reject(error);
            } else {
                resolve({ key, data, file });
            }
        });
    });
}

function testIfExpected(entry) {
    let name = entry.key.toUpperCase();
    let expected = EXPECTED[entry.key];
    if (entry.data == expected) {
        log(colors.green(`${name} test successful`));
    } else {
        passAllTest = false;
        log(colors.red(`${name} test failed`));
        log(
            `${colors.yellow(entry.data)} didn't match with ${colors.yellow(
                expected
            )}`
        );
    }
}

function test(callback) {
    const DEST = path.join(config.root.base, config.root.dest, "*");
    glob(DEST, (error, files) => {
        Promise.all(files.map(readFileAsync)).then(entries => {
            entries.forEach(entry => {
                if (entry.key == "js") {
                    let array = [];
                    eval(entry.data);
                    entry.data = JSON.stringify(array);
                }
                testIfExpected(entry);
            });
            DEL(DEST, { force: true }).then(() => {
                callback();
                if (!passAllTest) {
                    process.exit(1);
                }
            });
        });
    });
}

module.exports = test;

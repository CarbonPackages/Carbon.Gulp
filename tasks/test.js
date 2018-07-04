const DEL = require("del");
const EXPECTED = config.tasks.test.expected;
EXPECTED.js = JSON.stringify(EXPECTED.js);

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

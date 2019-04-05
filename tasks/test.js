const DEL = require('del');
const EXPECTED = config.tasks.test.expected;
EXPECTED.js = JSON.stringify(EXPECTED.js);

let passAllTest = true;

function readFileAsync(file) {
    return new Promise((resolve, reject) => {
        fs.readFile(file, 'utf8', (error, data) => {
            let key = path.basename(file);
            if (error) {
                reject(error);
            } else {
                resolve({ key, data, file });
            }
        });
    });
}

function testIfExpected(entry) {
    let expected = EXPECTED[entry.file];
    if (expected) {
        if (entry.data == expected) {
            log(colors.green(`${entry.key} test successful`));
        } else {
            passAllTest = false;
            log(colors.red(`${entry.key} test failed`));
            log(
                `${colors.yellow(entry.data)} didn't match with ${colors.yellow(
                    expected
                )}`
            );
        }
    }
}

function test(callback) {
    const DEST = path.join(config.root.base, config.root.dest, '**');
    glob(DEST, (error, entry) => {
        let files = entry.filter(file => fs.lstatSync(file).isFile());
        files.push('Test/Private/Images/Polygon.svg');
        Promise.all(files.map(readFileAsync))
            .then(entries => {
                entries.forEach(entry => {
                    if (entry.file == 'Test/Public/Test.js') {
                        let array = [];
                        eval(entry.data);
                        entry.data = JSON.stringify(array);
                    }
                    if (
                        entry.file == 'Test/Public/Test.css' ||
                        entry.file == 'Test/Private/Images/Polygon.svg'
                    ) {
                        entry.data = entry.data.replace(/\n/g, 'XXX');
                    }
                    testIfExpected(entry);
                });
                DEL(DEST, { force: true }).then(() => {
                    callback();
                    if (!passAllTest) {
                        process.exit(1);
                    }
                });
            })
            .catch(error => {
                console.log(error);
            });
    });
}

module.exports = test;

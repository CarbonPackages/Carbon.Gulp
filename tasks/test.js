const DEL = require('del');
const EXPECTED = config.tasks.test.expected;
EXPECTED.js = JSON.stringify(EXPECTED.js);

let passAllTest = true;
let deleteFiles = [];

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

function pushToDeleteFiles(entry) {
    if (!entry.file.match('/Private/')) {
        deleteFiles.push(entry.file);
    }
}

function testIfExpected(entry) {
    let expected = EXPECTED[entry.file];
    if (expected) {
        if (
            (typeof expected == 'string' && expected == entry.data) ||
            (typeof expected == 'object' && expected.includes(entry.data))
        ) {
            log(colors.green(`${entry.key} test successful`));
            pushToDeleteFiles(entry);
        } else {
            passAllTest = false;
            fs.writeFileSync(`Test/Public/Expected-${entry.key}`, expected);
            log(colors.red(`${entry.key} didn't match with expected result:`));
            log(entry.data);
        }
        return;
    }
    pushToDeleteFiles(entry);
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
                DEL(deleteFiles, { force: true }).then(() => {
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

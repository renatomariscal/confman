'use strict';

const fs = require('fs');
const chalk = require('chalk');
const path = require('path');
const glob = require('glob');

function addCommand(program) {
    program
        .command('get <property> [environment]')
        .action(action);
}

function action(property, environment, options) {
    var searchString = `./config/${environment || '*'}.json`;
    glob(searchString, (err, files) => {
        if (err) {
            console.error(chalk.red(err));
            process.exitCode = 1;
        }

        if (files.length === 0) {
            console.log(`No configuration found in '${chalk.bold(searchString)}'`);
            return;
        }
        var headerEnv = 'Environment';
        var headerValue = 'JSON Value';

        var maxFileNameLength = files
            .map(file => path.parse(file).name.length)
            .reduce((a, b) => { return Math.max(a, b); }, headerEnv.length);

        console.log(chalk.yellow(headerEnv + ' '.repeat(maxFileNameLength - headerEnv.length + 2) + headerValue));

        for (var file of files) {
            var object;
            try {
                var content = fs.readFileSync(file);
                object = JSON.parse(content);
            } catch (e) {
                console.error(chalk.red(`Error reading '${file}':`, e));
            }

            var fileName = path.parse(file).name;
            var value = JSON.stringify(getProperty(property, object));
            if (value === undefined) {
                value = chalk.red('undefined');
            } else {
                value = chalk.green(value);
            }
            console.log(fileName + ': ' + (' '.repeat(maxFileNameLength - fileName.length)) + value);
        }
    });
}


function getProperty(property, o) {
    var piecesLeft = property.split('.');
    var value = o;
    while (piecesLeft.length && value !== undefined) {
        var current = piecesLeft.shift();
        value = value[current];
    }

    return value;
}

module.exports = addCommand;
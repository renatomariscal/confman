'use strict';

const fs = require('fs');
const chalk = require('chalk');
const path = require('path');
const glob = require('glob');
const Table = require('./table');
function addCommand(program) {
    program
        .command('struct [environment]')
        .action(action);
}

function action(environment, options) {
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
        var keys = {};
        for (var file of files) {
            var object;
            try {
                var content = fs.readFileSync(file);
                object = JSON.parse(content);
            } catch (e) {
                console.error(chalk.red(`Error reading '${file}':`, e));
            }

            var fileName = path.parse(file).name;
            readKeys(keys, fileName, object, []);
        }

        var fileNames = files.map(file => path.parse(file).name);
        var table = new Table();
        table.column(chalk.bold('key'));
        fileNames.forEach(f => table.column(chalk.bold(f+' ')));

        fillTable(keys, table, fileNames, 0);
        console.log(table.toString());
    });
}


function readKeys(keys, fileName, object) {
    for (var key in object) {
        var keyElement = keys[key];
        if (!(key in keys)) {
            keyElement = { _files: [] };
            keys[key] = keyElement;
        }

        keyElement._files.push(fileName);

        var objectElement = object[key];
        var typeObjectElement = typeof objectElement;
        if (['object', 'array'].includes(typeObjectElement)) {
            readKeys(keyElement, fileName, object[key]);
        }
    }
}

function fillTable(keys, table, files, depth) {
    table.line();
    for (var key in keys) {
        if (key === '_files') { continue; }
        table.column(' '.repeat(depth * 2) + key);
        for (var file of files) {
            table.column(keys[key]._files.includes(file) ? chalk.green('✔') : chalk.red('X'));
        }
        fillTable(keys[key], table, files, depth + 1);
    }
}

module.exports = addCommand;
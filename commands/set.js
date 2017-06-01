'use strict';

const fs = require('fs');
const chalk = require('chalk');
const path = require('path');
const glob = require('glob');

function addCommand(program) {
    program
        .command('sets <property> <value> [environment]')
        .action(action.bind(null, 'string'));
    program
        .command('setj <property> <value> [environment]')
        .action(action.bind(null, 'json'));
    program
        .command('delete <property> [environment]')
        .action((property, environment, options) => 
            action('delete', property, null, environment, options));
}

function action(type, property, newValueParam, environment, options) {
    var searchString = `./config/${environment || '*'}.json`;
    var newValueJson;
    var newValue;
    if (type === 'json') {
        newValueJson = newValueParam;
        try {
            newValue = JSON.parse(newValueJson);
        } catch (e) {
            console.error(chalk.red(`New value is not valid json`, e));
            return;
        }
    } else if (type === 'string') {
        newValue = newValueParam;
        newValueJson = newValueParam;
    } else if (type === 'delete') {
        newValue = undefined;
        newValueJson = undefined;
    }

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
        var headerStatus = 'Status';

        var maxFileNameLength = files
            .map(file => path.parse(file).name.length)
            .reduce((a, b) => { return Math.max(a, b); }, headerEnv.length);

        console.log(chalk.yellow(headerEnv + ' '.repeat(maxFileNameLength - headerEnv.length + 2) + headerStatus));

        for (var file of files) {
            var object;
            try {
                var content = fs.readFileSync(file);
                object = JSON.parse(content);
            } catch (e) {
                console.error(chalk.red(`Error reading '${file}':`, e));
            }

            var fileName = path.parse(file).name;
            var currentValue = JSON.stringify(getProperty(property, object));
            var status;
            if (currentValue === newValueJson) {
                status = chalk.gray('unchanged');
            } else if (currentValue === undefined) {
                status = chalk.cyan('created');
            } else if (newValue === undefined) {
                status = chalk.cyan('deleted');
            } else {
                status = chalk.green('updated');
            }
            setProperty(property, newValue, object);
            fs.writeFileSync(file, JSON.stringify(object, null, 2));
            console.log(fileName + ': ' + (' '.repeat(maxFileNameLength - fileName.length)) + status);
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


function setProperty(property, newValue, o) {
    var piecesLeft = property.split('.');
    var value = o;
    while (piecesLeft.length > 1) {
        var current = piecesLeft.shift();
        var nextValue = value[current];
        if (nextValue === undefined) {
            nextValue = {};
            value[current] = nextValue;
        }
        value = nextValue;
    }
    value[piecesLeft.shift()] = newValue;
}

module.exports = addCommand;
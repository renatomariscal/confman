#!/usr/bin/env node

'use strict';
const program = require('commander');
const getCommand = require('./commands/get');
const setCommand = require('./commands/set');
const structCommand = require('./commands/struct');
const version = require('../package.json').version;

program.version(version);
getCommand(program);
setCommand(program);
structCommand(program);
program.parse(process.argv);
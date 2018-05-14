var chalk = require('chalk');

class Table {
    constructor() {
        this.lines = [];
        this.line();
    }

    line() {
        this.current = [];
        this.lines.push(this.current);
    }

    column(value) {
        this.current.push(value);
    }

    toString() {
        var sizes = [];
        this.lines.forEach(line => {
            line.forEach((value, index) => {
                sizes[index] = Math.max(chalk.stripColor(value).length, sizes[index] || 0);
            });
        });

        return this.lines
            .map(line => line
                .map((value, index) => value + ' '.repeat(sizes[index] - chalk.stripColor(value).length))
                .join(' '))
            .join('\n');
    }
}

module.exports = Table;
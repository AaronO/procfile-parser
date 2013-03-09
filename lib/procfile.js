// Requires
var _ = require('underscore');

var os = require('os');

// Utility functions
function trim(line) {
    return line.trim();
}

// remove empty lines
function empty(line) {
    return !! line.length;
}

// Only keep lines that returned full objects
function badlines(line) {
    return 'object' === typeof line;
}

function parseRaw(raw) {
    var cmd = null;
    var args = [];
    var env = {};

    // Have we found the command yet
    var hasCmd = false;

    var rawParts = _.compact(raw.split(' '));

    // Parse each chunk to find env variables command and arguments
    _.each(rawParts, function (chunk) {
        if (!hasCmd && chunk.search('=') !== -1) {
            // Environment variable
            var envVar = chunk.split('=');
            env[envVar[0]] = envVar[1];
        } else if (!hasCmd) {
            // Actual command
            cmd = chunk;
            hasCmd = true;
        } else {
            // Arguments
            args.push(chunk);
        }
    });


    return {
        args: args,
        env: env,
        cmd: cmd
    };
}

function parseLine(line) {
    var cmd = { cmd: null, args: [], env: {}, raw: null, name: null };
    var parts = line.split(': ');

    // Invalid line
    if (2 !== parts.length) {
        return null;
    }

    // Name
    cmd.name = parts[0];

    // Raw part = env + args + cmd
    cmd.raw = parts[1];

    // Parse raw to get env, args and command
    _.extend(
        cmd,
        parseRaw(cmd.raw)
    );

    return cmd;
}

// Return a list of objects
// one object for each line
function parseLines(data) {
    return data
    .split(os.EOL)
    .map(trim)
    .filter(empty)
    .map(parseLine)
    .filter(badlines);
}

function parse(data) {
    var cmds = parseLines(data);

    return _.object(
        _.map(cmds, function(cmd) {
            return [cmd.name, cmd];
        })
    );
}


// Exports
exports.parse = parse;
exports.parseLine = parseLine;
exports.parseLines = parseLines;

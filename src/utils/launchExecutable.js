const pty = require('node-pty');
const path = require("path");
const launchEmitter = new (require('events'))();
const releasesPath = path.join(__dirname, '..', '..', 'cache', 'releases');

function launchExecutable(executableName) {
    const ptyProcess = pty.spawn(`./${executableName}`, [], {
        name: 'xterm-color',
        cwd: path.join(releasesPath, executableName),
        env: process.env
    });

    ptyProcess.onData(data => {
        launchEmitter.emit('stdout', data);
    });

    ptyProcess.onExit(({ exitCode, signal }) => {
        launchEmitter.emit('exit', exitCode);
    });

    function write(data) {
        ptyProcess.write(data);
    }

    function kill() {
        ptyProcess.kill();
    }

    return {
        write,
        kill,
    };
}

function getLaunchEmitter() {
    return launchEmitter;
}

module.exports = {
    getLaunchEmitter,
    launchExecutable,
}
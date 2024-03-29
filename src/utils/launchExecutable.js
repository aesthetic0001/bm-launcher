const pty = require('node-pty');
const path = require("path");
const launchEmitter = new (require('events'))();
let releasesPath

function setReleasesPath(newReleasesPath) {
    releasesPath = newReleasesPath;
}

function launchExecutable(executableName) {
    const terminalExecutable = process.platform === 'win32' ? 'cmd.exe' : 'zsh';
    const ptyProcess = pty.spawn(terminalExecutable, [], {
        name: 'xterm-color',
        cwd: path.join(releasesPath, executableName),
        env: process.env,
        rows: 50,
        cols: 200,
    });

    switch (process.platform) {
        case 'win32':
            ptyProcess.write(`.\\${executableName}\r`);
            break;
        case 'linux':
            ptyProcess.write(`./${executableName}\n`);
            break;
        case 'darwin':
            ptyProcess.write(`./${executableName}\n`);
            break;
    }

    ptyProcess.onData(data => {
        launchEmitter.emit('stdout', data);
    });

    ptyProcess.onExit(({exitCode, signal}) => {
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
    setReleasesPath
}

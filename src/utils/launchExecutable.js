const {dirname} = require("path");
const { spawn } = require('child_process');
const path = require("path");
const launchEmitter = new (require('events'))();
const releasesPath = path.join(__dirname, '..', '..', 'cache', 'releases');

function launchExecutable(executableName) {
    const child = spawn(executableName, {
        detached: true,
        stdio: 'ignore',
        cwd: dirname(path.join(releasesPath, executableName)),
    });

    child.stdout.on('data', (data) => {
        launchEmitter.emit('stdout', data);
    });

    child.on('close', (code) => {
        launchEmitter.emit('close', code);
    });

    child.on('exit', (code) => {
        launchEmitter.emit('exit', code);
    });
}

function getLaunchEmitter() {
    return launchEmitter;
}

module.exports = {
    getLaunchEmitter,
    launchExecutable,
}
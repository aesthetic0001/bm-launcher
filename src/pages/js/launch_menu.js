const {ipcRenderer} = require('electron');
const {checkForUpdates, getEmitter} = require("../../utils/releaseChecker");
const {launchExecutable, getLaunchEmitter} = require("../../utils/launchExecutable");
const fs = require("fs");
const path = require("path");
const botType = window.document.getElementById('bot_type');
const bmKey = window.document.getElementById('bm_key');
const launchButton = window.document.getElementById('launch');
const toastDiv = window.document.getElementById('toasts');

const releasesPath = path.join(__dirname, '..', '..', '..', 'cache', 'releases');
const updateEmitter = getEmitter()
const launchEmitter = getLaunchEmitter()
let launching = false;
let config = {};
let write, kill;

launchEmitter.on('stdout', (data) => {
    console.log(`stdout: ${data}`);
    launchButton.innerHTML = 'Stop'
    launchButton.className = 'btn btn-error w-full max-w-sm'
})

launchEmitter.on('exit', (code) => {
    console.log(`child process exited with code ${code}`);
    launching = false
    launchButton.innerHTML = 'Launch'
    launchButton.className = 'btn btn-success w-full max-w-sm'
})

updateEmitter.on('checking', () => {
    console.log('Checking for updates...')
    launchButton.innerHTML = 'Checking for updates...'
    launchButton.className = 'btn btn-disabled w-full max-w-sm'
})

updateEmitter.on('downloading', () => {
    console.log('Update available!')
    launchButton.innerHTML = 'Downloading update...'
    launchButton.className = 'btn btn-disabled w-full max-w-sm'
})

updateEmitter.on('up-to-date', () => {
    console.log('Update downloaded!')
    launchButton.innerHTML = 'Up to date!'
    launchButton.className = 'btn btn-disabled w-full max-w-sm'
})

ipcRenderer.send('get_config');

ipcRenderer.on('config', (event, stringifiedConfig) => {
    config = JSON.parse(stringifiedConfig);
    if (config.cachedMode) botType.value = config.cachedMode;
    if (config.cachedKey) bmKey.value = config.cachedKey;
})

botType.addEventListener('input', () => {
    config.cachedMode = botType.value;
    ipcRenderer.send('config', JSON.stringify(config))
})

bmKey.addEventListener('input', () => {
    config.cachedKey = bmKey.value;
    ipcRenderer.send('config', JSON.stringify(config))
})

window.document.getElementById('launch').addEventListener('click', async () => {
    if (bmKey.value.length === 0 && !launching) {
        const toast = document.createElement('div')
        toast.className = "alert alert-error"
        toast.innerHTML = '<span>Please enter a key before launching!</span>'
        toastDiv.appendChild(toast)
        setTimeout(() => {
            toast.remove()
        }, 2500)
        return
    }
    launching = !launching
    if (launching) {
        launchButton.innerHTML = 'Launching...'
        launchButton.className = 'btn btn-disabled w-full max-w-sm'
    } else {
        launchButton.innerHTML = 'Launch'
        launchButton.className = 'btn btn-success w-full max-w-sm'
        kill()
        write = null
        kill = null
        return
    }
    console.log('Preparing for launch...')
    const {
        releaseName,
        releaseHash
    } = await checkForUpdates(botType.value.toLowerCase(), config.downloadCache)
    config.downloadCache[releaseName] = releaseHash
    fs.writeFileSync(path.join(releasesPath, releaseName.replaceAll('.zip', ''), 'lkey.txt'), bmKey.value)
    ipcRenderer.send('config', JSON.stringify(config))
    const fns = launchExecutable(releaseName.replaceAll('.zip', ''))
    write = fns.write
    kill = fns.kill
})
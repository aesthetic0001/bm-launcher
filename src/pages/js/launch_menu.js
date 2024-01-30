const {ipcRenderer} = require('electron');
const {checkForUpdates, getEmitter} = require("../../utils/releaseChecker");
const botType = window.document.getElementById('bot_type');
const bmKey = window.document.getElementById('bm_key');
const launchButton = window.document.getElementById('launch');
const toastDiv = window.document.getElementById('toasts');

const updateEmitter = getEmitter()
let launched = false;
let config = {};

updateEmitter.on('checking', () => {
    console.log('Checking for updates...')
    launchButton.innerHTML = 'Checking for updates...'
    launchButton.className = 'btn btn-warning w-full max-w-sm'
})

updateEmitter.on('downloading', () => {
    console.log('Update available!')
    launchButton.innerHTML = 'Downloading update...'
    launchButton.className = 'btn btn-warning w-full max-w-sm'
})

updateEmitter.on('up-to-date', () => {
    console.log('Update downloaded!')
    launchButton.innerHTML = 'Up to date!'
    launchButton.className = 'btn btn-success w-full max-w-sm'
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
    if (bmKey.value.length === 0 && !launched) {
        const toast = document.createElement('div')
        toast.className = "alert alert-error"
        toast.innerHTML = '<span>Please enter a key before launching!</span>'
        toastDiv.appendChild(toast)
        setTimeout(() => {
            toast.remove()
        }, 2500)
        return
    }
    launched = !launched
    if (launched) {
        launchButton.innerHTML = 'Launching...'
        launchButton.className = 'btn btn-error w-full max-w-sm'
    } else {
        launchButton.innerHTML = 'Launch'
        launchButton.className = 'btn btn-success w-full max-w-sm'
    }
    console.log('Preparing for launch...')
    const {
        releaseName,
        releaseHash
    } = await checkForUpdates(botType.value.toLowerCase(), config.downloadCache)
    config.downloadCache[releaseName] = releaseHash
    ipcRenderer.send('config', JSON.stringify(config))
})
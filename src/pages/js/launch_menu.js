const {ipcRenderer} = require('electron');
const {checkForUpdates, getEmitter} = require("../../utils/releaseChecker");
const fs = require("fs");
const path = require("path");
const Convert = require('ansi-to-html');
const convert = new Convert();

const botType = window.document.getElementById('bot_type');
const bmKey = window.document.getElementById('bm_key');
const launchButton = window.document.getElementById('launch');
const configureTabs = window.document.getElementsByClassName('config');
const toastDiv = window.document.getElementById('toasts');
const consoleDiv = window.document.getElementById('console_output');
const consoleInput = window.document.getElementById('console_input');

const releasesPath = path.join(__dirname, '..', '..', '..', 'cache', 'releases');
const updateEmitter = getEmitter()
let launching = false;
let config = {};

ipcRenderer.on('stdout', (event, data) => {
    launchButton.innerHTML = 'Stop'
    launchButton.className = 'btn btn-error w-full max-w-sm'
    const div = document.createElement('div')
    div.className = 'font-jetbrains p-2'
    div.innerHTML = convert.toHtml(data)
    consoleDiv.appendChild(div)
    consoleDiv.scrollTop = consoleDiv.scrollHeight;
})

ipcRenderer.on('exit', (event, code) => {
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
    setTimeout(() => {
        launchButton.innerHTML = '<span class="loading loading-spinner"></span>Starting...'
        launchButton.className = 'btn btn-disabled w-full max-w-sm'
    }, 1000)
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

consoleInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter' && launchButton.innerHTML === 'Stop') {
        ipcRenderer.send('console_input', consoleInput.value)
        consoleInput.value = ''
    }
})

for (const tab of configureTabs) {
    tab.addEventListener('click', () => {
        ipcRenderer.send('config_page');
    })
}

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
        consoleDiv.innerHTML = ''
    } else {
        launchButton.innerHTML = 'Launch'
        launchButton.className = 'btn btn-success w-full max-w-sm'
        ipcRenderer.send('kill')
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
    ipcRenderer.send('launch', releaseName.replaceAll('.zip', ''))
})

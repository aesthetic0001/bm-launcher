const {ipcRenderer} = require('electron');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const cachePath = path.join(__dirname, '..', '..', '..', 'cache');

const botType = window.document.getElementById('bot_type');
const bmKey = window.document.getElementById('bm_key');
const launchButton = window.document.getElementById('launch');
const toastDiv = window.document.getElementById('toasts');

let launched = false;

ipcRenderer.send('get_config');

ipcRenderer.on('config', (event, config) => {
    config = JSON.parse(config);
    if (config.cachedMode) botType.value = config.cachedMode;
    if (config.cachedKey) bmKey.value = config.cachedKey;
})

botType.addEventListener('input', () => {
    ipcRenderer.send('bot_type', botType.value);
})

bmKey.addEventListener('input', () => {
    ipcRenderer.send('bm_key', bmKey.value);
})

window.document.getElementById('launch').addEventListener('click', () => {
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
        launchButton.innerHTML = 'Stop'
        launchButton.className = 'btn btn-error w-full max-w-sm'
    } else {
        launchButton.innerHTML = 'Launch'
        launchButton.className = 'btn btn-success w-full max-w-sm'
    }
})
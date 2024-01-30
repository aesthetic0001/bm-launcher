const { ipcRenderer } = require('electron');

const botType = window.document.getElementById('bot_type');
const bmKey = window.document.getElementById('bm_key');

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
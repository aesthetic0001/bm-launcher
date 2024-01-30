const { ipcRenderer } = require('electron');
const getStartedButton = window.document.getElementById('get_started');

getStartedButton.addEventListener('click', () => {
    ipcRenderer.send('get_started');
})

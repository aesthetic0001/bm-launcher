const { ipcRenderer } = require('electron');
const $ = require('jquery');

$('#get_started').click(() => {
    ipcRenderer.send('get_started');
})

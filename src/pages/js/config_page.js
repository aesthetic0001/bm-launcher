const {ipcRenderer} = require('electron');
const config_page = require('monaco-editor');

const launchTabs = window.document.getElementsByClassName('launch_menu');

for (const tab of launchTabs) {
    tab.addEventListener('click', () => {
        ipcRenderer.send('launch_menu');
    })
}

config_page.editor.create(document.getElementById('monaco'), {
    value: 'function x() {\nconsole.log("Hello world!");\n}',
    language: 'javascript'
});

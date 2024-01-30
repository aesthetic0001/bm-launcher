const {ipcRenderer} = require('electron');
const loader = require('monaco-loader')

loader().then((monaco) => {
    const editor = monaco.editor.create(document.getElementById('container'), {
        language: 'javascript',
        theme: 'vs-dark',
        automaticLayout: true
    })
})

const launchTabs = window.document.getElementsByClassName('launch_menu');

for (const tab of launchTabs) {
    tab.addEventListener('click', () => {
        ipcRenderer.send('launch_menu');
    })
}

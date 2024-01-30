const {ipcRenderer} = require('electron');
const loader = require('monaco-loader')
const {checkForUpdates, getConfigPath} = require("../../utils/releaseChecker");
const fs = require("fs");
const botType = window.document.getElementById('bot_type');
const launchTabs = window.document.getElementsByClassName('launch_menu');

for (const tab of launchTabs) {
    tab.addEventListener('click', () => {
        ipcRenderer.send('launch_menu');
    })
}

let readyForModification = false;

ipcRenderer.once('config', async (event, data) => {
    const config = JSON.parse(data);

    let releaseConfig


    const monaco = await loader()

    const editor = monaco.editor.create(document.getElementById('container'), {
        language: 'json',
        theme: 'vs-dark',
        automaticLayout: true
    })

    async function setReleaseConfig() {
        readyForModification = false;
        editor.updateOptions({readOnly: true})
        const {releaseName, releaseHash} = await checkForUpdates(botType.value.toLowerCase(), config.downloadCache)
        config.downloadCache[releaseName] = releaseHash;
        ipcRenderer.send('config', JSON.stringify(config))
        releaseConfig = fs.readFileSync(getConfigPath(botType.value.toLowerCase())).toString()
        editor.setValue(releaseConfig)
        editor.updateOptions({readOnly: false})
        readyForModification = true;
    }

    await setReleaseConfig()


    editor.getModel().onDidChangeContent(() => {
        fs.writeFileSync(getConfigPath(botType.value.toLowerCase()), editor.getValue())
    })

    botType.addEventListener('change', async () => {
        await setReleaseConfig()
    })
})

ipcRenderer.send('get_config');
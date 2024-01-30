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

ipcRenderer.once('config', async (event, data) => {
    const config = JSON.parse(data);

    let releaseConfig

    async function setReleaseConfig() {
        const {releaseName, releaseHash} = await checkForUpdates(botType.value.toLowerCase(), config.downloadCache)
        config.downloadCache[releaseName] = releaseHash;
        ipcRenderer.send('config', JSON.stringify(config))
        releaseConfig = fs.readFileSync(getConfigPath(botType.value.toLowerCase())).toString()
    }


    await setReleaseConfig()

    const monaco = await loader()

    const editor = monaco.editor.create(document.getElementById('container'), {
        language: 'json',
        theme: 'vs-dark',
        automaticLayout: true
    })

    editor.setValue(releaseConfig)

    editor.getModel().onDidChangeContent(() => {
        fs.writeFileSync(getConfigPath(botType.value.toLowerCase()), editor.getValue())
    })

    botType.addEventListener('change', async () => {
        await setReleaseConfig()
    })
})

ipcRenderer.send('get_config');
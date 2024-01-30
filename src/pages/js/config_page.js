const {ipcRenderer} = require('electron');
const JSONEditor = require('jsoneditor')
const {checkForUpdates, getConfigPath} = require("../../utils/releaseChecker");
const fs = require("fs");
const botType = window.document.getElementById('bot_type');
const saveLocation = window.document.getElementById('savelocation');
const launchTabs = window.document.getElementsByClassName('launch_menu');

saveLocation.innerText = `Your configuration will be saved to ${getConfigPath(botType.value.toLowerCase())}. You can edit this file manually if you want a more thorough config.`

for (const tab of launchTabs) {
    tab.addEventListener('click', () => {
        ipcRenderer.send('launch_menu');
    })
}

let readyForModification = false;

ipcRenderer.once('config', async (event, data) => {
    const config = JSON.parse(data);

    let releaseConfig



    const editor = new JSONEditor(window.document.getElementById('container'), {
        onChangeJSON: (json) => {
            if (!readyForModification) return;
            releaseConfig = json;
            fs.writeFileSync(getConfigPath(botType.value.toLowerCase()), JSON.stringify(releaseConfig))
        },
        search: false
    })

    async function setReleaseConfig() {
        readyForModification = false;
        const {releaseName, releaseHash} = await checkForUpdates(botType.value.toLowerCase(), config.downloadCache)
        config.downloadCache[releaseName] = releaseHash;
        ipcRenderer.send('config', JSON.stringify(config))
        releaseConfig = JSON.parse(fs.readFileSync(getConfigPath(botType.value.toLowerCase())).toString())
        editor.set(releaseConfig)
        editor.setMode('form')
        editor.expandAll()
        readyForModification = true;
    }

    await setReleaseConfig()

    editor.set(releaseConfig)
    editor.setMode('form')
    editor.expandAll()

    botType.addEventListener('change', async () => {
        await setReleaseConfig()
    })
})

ipcRenderer.send('get_config');

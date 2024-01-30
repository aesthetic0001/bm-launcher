const {ipcRenderer} = require('electron');
const JSONEditor = require('jsoneditor')
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



    const editor = new JSONEditor(window.document.getElementById('container'), {
        onEditable: (node) => {
            return {
                field: false,
                value: readyForModification
            }
        },
        onChangeJSON: (json) => {
            if (!readyForModification) return;
            releaseConfig = json;
            fs.writeFileSync(getConfigPath(botType.value.toLowerCase()), JSON.stringify(releaseConfig))
        }
    })

    async function setReleaseConfig() {
        readyForModification = false;
        const {releaseName, releaseHash} = await checkForUpdates(botType.value.toLowerCase(), config.downloadCache)
        config.downloadCache[releaseName] = releaseHash;
        ipcRenderer.send('config', JSON.stringify(config))
        releaseConfig = JSON.parse(fs.readFileSync(getConfigPath(botType.value.toLowerCase())).toString())
        editor.set(releaseConfig)
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
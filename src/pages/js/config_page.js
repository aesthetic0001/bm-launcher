const {ipcRenderer} = require('electron');
const JSONEditor = require('jsoneditor')
const {once} = require("events");
const {checkForUpdates, getConfigPath, setReleasesPath} = require("../../utils/releaseChecker");
const fs = require("fs");
const path = require("path");
const botType = window.document.getElementById('bot_type');
const saveLocation = window.document.getElementById('savelocation');
const launchTabs = window.document.getElementsByClassName('launch_menu');

for (const tab of launchTabs) {
    tab.addEventListener('click', () => {
        ipcRenderer.send('launch_menu');
    })
}

let readyForModification = false;

async function main() {
    ipcRenderer.send('get_path');
    const [event, appPath] = await once(ipcRenderer, 'path')
    ipcRenderer.send('get_config');
    const [event2, data] = await once(ipcRenderer, 'config')

    setReleasesPath(path.join(appPath, 'launcher_cache', 'releases'))

    saveLocation.innerText = `Your configuration will be saved to ${getConfigPath(botType.value.toLowerCase())}. You can edit this file manually if you want a more thorough config.`

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
}

main()
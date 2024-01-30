const { app, BrowserWindow } = require('electron/main')
const path = require('node:path')
const fs = require("fs");

if (!fs.existsSync(path.join(__dirname, 'cache'))) {
    fs.mkdirSync(path.join(__dirname, 'cache'))
    fs.writeFileSync(path.join(__dirname, 'cache', 'config.json'), JSON.stringify({
        firstTime: true,
        cachedKey: null,
        cachedMode: null,
        launcherOptions: {
            enableBeta: false,
        }
    }))
}

const configCache = require(path.join(__dirname, 'cache', 'config.json'))

const configProxy = new Proxy(configCache, {
    set: (target, p, value) => {
        target[p] = value
        fs.writeFileSync(path.join(__dirname, 'cache', 'config.json'), JSON.stringify(target))
        return true
    }
})

global.launcherConfig = configProxy

function createWindow () {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true
        }
    })

    win.loadFile(launcherConfig.firstTime ? './src/pages/welcome.html' : './src/pages/launch_menu.html')
}

app.whenReady().then(() => {
    createWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

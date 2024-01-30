const {app, BrowserWindow} = require('electron/main')
const {ipcMain} = require('electron')
const path = require('node:path')
const fs = require("fs");
const {launchExecutable, getLaunchEmitter} = require("./src/utils/launchExecutable");

if (!fs.existsSync(path.join(__dirname, 'cache'))) {
    fs.mkdirSync(path.join(__dirname, 'cache'))
    fs.mkdirSync(path.join(__dirname, 'cache', 'releases'))
    fs.writeFileSync(path.join(__dirname, 'cache', 'config.json'), JSON.stringify({
        firstTime: true,
        cachedKey: null,
        cachedMode: null,
        launcherOptions: {
            enableBeta: false,
        },
        downloadCache: {}
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


const launchEmitter = getLaunchEmitter()

let write, kill;

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            nodeIntegrationInWorker: false,
        }
    })

    win.webContents.openDevTools()

    win.loadFile(configProxy.firstTime ? './src/pages/welcome.html' : './src/pages/launch_menu.html')
}

function getCurrentWindow() {
    return BrowserWindow.getAllWindows()[0]
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

ipcMain.on('get_started', () => {
    getCurrentWindow().loadFile('./src/pages/launch_menu.html')
    configProxy.firstTime = false
})

ipcMain.on('get_config', (event) => {
    event.reply('config', JSON.stringify(configProxy))
})

ipcMain.on('config', (event, cfg) => {
    const config = JSON.parse(cfg)
    for (const key in config) {
        configProxy[key] = config[key]
    }
})

ipcMain.on('launch_menu', () => {
    getCurrentWindow().loadFile('./src/pages/launch_menu.html')
})

ipcMain.on('config_page', () => {
    getCurrentWindow().loadFile('./src/pages/config.html')
})

ipcMain.on('launch', (event, executableName) => {
    const fns = launchExecutable(executableName)
    write = fns.write
    kill = fns.kill
})

ipcMain.on('kill', () => {
    kill()
    write = null
    kill = null
})

ipcMain.on('console_input', (event, data) => {
    write(data.trim() + (process.platform === 'win32' ? '\r\n' : '\n'))
})

launchEmitter.on('stdout', (data) => {
    if (data.match(/\x1b]0;.*?\x07/g, '')) {
        return
    }
    getCurrentWindow().webContents.send('stdout', data)
})

launchEmitter.on('exit', (exitCode) => {
    getCurrentWindow().webContents.send('exit', exitCode)
    write = null
    kill = null
})

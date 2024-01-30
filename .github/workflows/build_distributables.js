const builder = require("electron-builder")
const Platform = builder.Platform

/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const options = {
    extends: null,
    appId: "com.binmaster.launcher",
    productName: "BinMaster Launcher",
    artifactName: "${productName}-${version}.${ext}",
    asar: true,
    compression: "maximum",
    removePackageScripts: true,
    nodeGypRebuild: false,
    buildDependenciesFromSource: false,
    directories: {
        output: "dist/artifacts/local",
        buildResources: "installer/resources"
    },
    win: {
        target: 'msi'
    },
    mac: {
        target: 'dmg'
    },
    dmg: {
        contents: [
            {
                x: 255,
                y: 85,
                type: "file"
            },
            {
                x: 253,
                y: 325,
                type: "link",
                path: "/Applications"
            }
        ],
        window: {
            width: 500,
            height: 500
        }
    },
    linux: {
        target: ["AppImage", "deb"]
    },
    deb: {
        priority: "optional",
    }
};

// Promise is returned
builder.build({
    targets: [Platform.MAC.createTarget(), Platform.WINDOWS.createTarget(), Platform.LINUX.createTarget()],
    config: options
})
    .then((result) => {
        console.log(JSON.stringify(result))
    })
    .catch((error) => {
        console.error(error)
    })
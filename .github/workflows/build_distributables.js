const builder = require("electron-builder")
const Platform = builder.Platform

/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const options = {
    extends: null,
    productName: "BinMaster Launcher",
    artifactName: "${productName}-${version}.${ext}",
    asar: true,
    compression: "maximum",
    removePackageScripts: true,
    nodeGypRebuild: false,
    buildDependenciesFromSource: false,
    directories: {
        output: "dist/artifacts/",
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

const targets = [Platform.WINDOWS.createTarget()]

async function main() {
    for (const target of targets) {
        const path = await builder.build({
            targets: target,
            config: options
        })
        console.log(path)
    }
}

main()

const builder = require("electron-builder")
const fs = require("fs");
const Platform = builder.Platform
const path = require("path")
/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const options = {
    extends: null,
    productName: "BinMaster Launcher",
    artifactName: "binmaster-launcher-${version}-${arch}.${ext}",
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
        target: 'msi',
    },
    mac: {
        target: 'dmg',
    },
    linux: {
        executableName: "BinMaster Launcher",
        artifactName: "binmaster-launcher-${version}-${arch}.${ext}",
        target: 'deb',
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
    deb: {
        priority: "optional",
    }
};

const targets = {
    win32: Platform.WINDOWS.createTarget(),
    linux: Platform.LINUX.createTarget(),
    darwin: Platform.MAC.createTarget()
}

if (fs.existsSync(path.join(__dirname, '..', '..', 'out'))) {
    fs.rmSync(path.join(__dirname, '..', '..', 'out'), {recursive: true})
}

fs.mkdirSync(path.join(__dirname, '..', '..', 'out'))

async function main() {
    const outpaths = await builder.build({
        ...options,
        targets: targets[process.platform]
    })
    console.log(outpaths)
    fs.renameSync(outpaths[0], path.join(__dirname, '..', '..', 'out', path.basename(outpaths[1])))
}

main()

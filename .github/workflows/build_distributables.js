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
    artifactName: "binmaster-launcher-${version}.${ext}",
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
        defaultArch: "x64",
    },
    mac: {
        target: 'dmg',
        defaultArch: "x64",
    },
    linux: {
        target: ["AppImage", "deb"],
        defaultArch: "x64",
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

const targets = [
    Platform.WINDOWS.createTarget(),
    Platform.MAC.createTarget(),
    Platform.LINUX.createTarget()
]

if (fs.existsSync(path.join(__dirname, '..', '..', 'out'))) {
    fs.rmSync(path.join(__dirname, '..', '..', 'out'), {recursive: true})
}

fs.mkdirSync(path.join(__dirname, '..', '..', 'out'))

async function main() {
    for (const target of targets) {
        console.log(target)
        const outpaths = await builder.build({
            targets: [
                target
            ],
            config: options
        })
        console.log(outpaths)
        fs.renameSync(outpaths[0], path.join(__dirname, '..', '..', 'out', path.basename(outpaths[0])))
    }
}

main()

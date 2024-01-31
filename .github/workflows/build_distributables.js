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
    },
    mac: {
        target: 'dmg',
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

const targetWin = builder.createTargets([
        Platform.WINDOWS,
    ], null, "x64")

const targetMac = builder.createTargets([
    Platform.MAC,
], null, "arm64")

const targets = [targetWin, targetMac]

if (fs.existsSync(path.join(__dirname, '..', '..', 'out'))) {
    fs.rmSync(path.join(__dirname, '..', '..', 'out'), {recursive: true})
}

fs.mkdirSync(path.join(__dirname, '..', '..', 'out'))

async function main() {
    const outpaths = []
    for (const target of targets) {
        const result = await builder.build({
            options,
            targets: target
        })
        outpaths.push(result[0])
    }
    for (const outpath of outpaths) {
        fs.renameSync(outpath, path.join(__dirname, '..', '..', 'out', path.basename(outpath)))
    }
    console.log(outpaths)
}

main()

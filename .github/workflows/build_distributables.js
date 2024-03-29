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

if (fs.existsSync(path.join(__dirname, '..', '..', 'out'))) {
    fs.rmSync(path.join(__dirname, '..', '..', 'out'), {recursive: true})
}

fs.mkdirSync(path.join(__dirname, '..', '..', 'out'))

async function main() {
    const outpaths = await builder.build({
        targets: Platform.current().createTarget(),
        config: options
    })
    for (const outpath of outpaths) {
        fs.renameSync(outpath, path.join(__dirname, '..', '..', 'out', path.basename(outpath)))
    }
}

main()

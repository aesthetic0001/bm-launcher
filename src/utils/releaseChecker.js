const axios = require('axios');
const unzipper = require('unzipper');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');

const releasesPath = path.join(__dirname, '..', '..', 'cache', 'releases');
const platform = process.platform;
const releaseCheckEmitter = new (require('events'))();

function getHash(fileBuffer) {
    const hash = crypto.createHash('sha256');
    hash.update(fileBuffer);
    return hash.digest('hex');
}

const releaseNameMap = {
    auction: {
        win32: 'binmaster-auction-win.exe.zip',
        linux: 'binmaster-auction-linux.zip',
        darwin: 'binmaster-auction-macos.zip',
    },
    slayer: {
        win32: 'binmaster-slayer-win.exe.zip',
        linux: 'binmaster-slayer-linux.zip',
        darwin: 'binmaster-slayer-macos.zip',
    },
}

async function getChecksumMap() {
    const checksum = await axios.get(`https://raped.gay/releases/checksum.txt`, {responseType: 'text'});
    const checksumMap = {};

    for (const line of checksum.data.split('\n')) {
        const [hash, name] = line.trim().split(' ');
        checksumMap[name] = hash;
    }
    return checksumMap;
}

async function downloadRelease(type, downloadCache) {
    const releaseName = releaseNameMap[type][platform];
    const release = await axios.get(`https://raped.gay/releases/${releaseName}`, {responseType: 'arraybuffer'});
    const checksumMap = await getChecksumMap();

    const releaseHash = getHash(Buffer.from(release.data));
    if (checksumMap[releaseName] !== releaseHash) {
        throw new Error(`Checksum mismatch for release ${releaseName}! Expected ${checksumMap[releaseName]}, got ${releaseHash}`)
    }

    const stream = Readable.from(Buffer.from(release.data));

    await stream.pipe(unzipper.Extract({path: path.join(releasesPath, releaseName.replaceAll('.zip', ''))})).promise();

    releaseCheckEmitter.emit('up-to-date', releaseName);
    return releaseHash
}

async function checkForUpdates(type, downloadCache) {
    releaseCheckEmitter.emit('checking');
    const releaseName = releaseNameMap[type][platform];
    const fileExists = fs.readdirSync(releasesPath).includes(releaseName.replaceAll('.zip', ''));
    if (!fileExists && !downloadCache[releaseName]) {
        console.log(`Release ${releaseName} not found! Downloading...`)
        releaseCheckEmitter.emit('downloading', releaseName);
        return await downloadRelease(type);
    }
    const checksumMap = await getChecksumMap();
    const releaseHash = downloadCache[releaseName];
    if (checksumMap[releaseName] !== releaseHash) {
        console.log(`Checksum mismatch for release ${releaseName}! Updating to new release...`)
        releaseCheckEmitter.emit('update', releaseName);
        return await downloadRelease(type);
    }
    releaseCheckEmitter.emit('up-to-date');
    return releaseHash
}

function getEmitter() {
    return releaseCheckEmitter;
}

module.exports = {
    checkForUpdates,
    getEmitter,
}
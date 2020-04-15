const fsp = require("fs").promises
const path = require('path')

const dataPath = '../data'

/**
 * Write the payload to a local data file
 *
 * @param payload
 * @returns {void | Promise<void> | *}
 */
module.exports = {
  run: (payload) => {
    const dataFileNameLatest = `latestValues-${payload.sensor}.json`
    const fullPath = path.join(dataPath, dataFileNameLatest)

    payload.persistedAt = new Date().toISOString()
    console.info(`writing to file ${fullPath}`)

    return fsp.writeFile(fullPath, JSON.stringify(payload, null, 4) +'\n')
  },
  name: 'local-json',
  debounceWait: process.env.PROCESSORS_LOCAL_JSON_DEBOUNCE_WAIT || 100 // ms
}

const fsp = require("fs").promises
const path = require('path')

const dataPath = '../data'
/**
 * Write the payload to a local data file
 *
 * @param payload
 * @returns {void | Promise<void> | *}
 */
module.exports = function localJSON(payload) {
  const dataFileNameLatest = `latestValues-${payload.sensor}.json`
  const fullPath = path.join(dataPath, dataFileNameLatest)

  console.info(`writing to file ${fullPath}`)
  return fsp.writeFile(fullPath, JSON.stringify(payload, null, 4) +'\n')
}

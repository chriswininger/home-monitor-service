const router = require('express').Router()
const fsp = require('fs').promises
const path = require('path')

const BASE_FOLDER =  __dirname + '/../../data/'
const PREFIX = 'latestValues-'
const baseTempFilePath = __dirname + '/../../data/' + PREFIX

router.get('/last-temperatures/:sensorName', async (req, res) => {
  const sensorName = req.params.sensorName

  const readFileResult = await readSensorFile(sensorName)

  const jsonValue = readFileResult.toString()

  res.status(200).json(jsonValue)
})

router.get('/last-temperatures', async (req, res) => {
  const matchingDatafiles = await getAllSensorNames()

  const dataFileReads = matchingDatafiles.map(sensorName => readSensorFile(sensorName))

  const sensorReadings = await Promise.all(dataFileReads)

  const sensorReadingsWrapped = `[${sensorReadings.join(',')}]`

  res.status(200).json(sensorReadingsWrapped)
})

router.get('/sensor-names', async (req, res) => {
  const matchingDatafiles = await getAllSensorNames()

  res.status(200).json(matchingDatafiles)
})

async function getAllSensorNames() {
  const files = await fsp.readdir(BASE_FOLDER)

  return files
    .filter(fileName => isSensorDataFile(fileName))
    .map(fileName => stripExtensionAndPrefix(fileName))
}

function isSensorDataFile(fileName) {
  return fileName.indexOf('.json') > 0 && fileName.indexOf(PREFIX) >= 0
}

function stripExtensionAndPrefix(fileName) {
  return fileName.replace(PREFIX, '')
    .replace('.json', '')
}

async function readSensorFile(sensorName) {
  const fullPath = baseTempFilePath + sensorName + '.json'
  const readFileResult = await fsp.readFile(fullPath)

  return readFileResult.toString()
}

module.exports = router

const router = require('express').Router()
const fsp = require('fs').promises
const path = require('path')

const baseTempFilePath = __dirname + '/../../data/latestValues-'

router.get('/last-temperature/:sensorName', async (req, res) => {
  const sensorName = req.params.sensorName

  const fullPath = baseTempFilePath + sensorName + '.json'
  const readFileResult = await fsp.readFile(fullPath)

  const jsonValue = readFileResult.toString()


  res.status(200).json(jsonValue)
})

module.exports = router

/*
    serial-monitor
    Author: Chris Wininger
    Notes: A file called .env should be placed in the root directory. Do not check this file in!
        It should contain:  the "API_KEY" for the lambda and the SERIAL_PORT address
 */

require('dotenv').config()

const SerialPort = require('serialport')
const localJsonProcessor = require('./processors/local-json')
const s3Processor = require('./processors/s3')
const getDebouncedProcessor = require('./processors/utils/get-debounced-processor')
const PORT = process.env.SERIAL_PORT
const BAUD_RATE = 57600

const enabledProcessor = [
  getDebouncedProcessor(localJsonProcessor),
  getDebouncedProcessor(s3Processor)
]

console.log(`Using port: ${PORT}, baud rate: ${BAUD_RATE}`)

// listen on the serial port for the temperature monitor
const port = new SerialPort(PORT, { baudRate: BAUD_RATE })

port.on('error', err => console.warn('error: ' + err))

port.on('data', payload => {
    const time = new Date(Date.now())
    console.log(`(${time}) received message: ${payload}`)

    enabledProcessor.forEach(processor => processor(payload, time))
})

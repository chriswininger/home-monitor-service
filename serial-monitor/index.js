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

/*
  This code must handle the fact that depending on the JeeNode/Arduino the messages may not arrive over the serial port
  as a single message.
 */
let buffer = ''
let inEvent = false
port.on('data', payload => {
  const time = new Date(Date.now())

  const payloadTrimmed = payload.toString().trim()
  const lastChar = payloadTrimmed[payloadTrimmed.length -1]
  const firstChar = payloadTrimmed[0]

  if (firstChar == '{') {
    inEvent = true
    buffer = payloadTrimmed
  } else if (inEvent) {
    buffer += payload

    if (lastChar == '}') {
      console.log(`(${time}) received full message: "${buffer}"`)

      enabledProcessor
        .forEach(processor => processor(buffer, time))

      buffer = ''
      inEvent = false
    }
  }
})

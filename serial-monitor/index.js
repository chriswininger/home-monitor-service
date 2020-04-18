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
const simpleLogProcessor = require('./processors/simple-log')
const getDebouncedProcessor = require('./processors/utils/get-debounced-processor')
const uuidv4 = require('uuid/v4')
const PORT = process.env.SERIAL_PORT
const BAUD_RATE = 57600

const enabledProcessor = [
  getDebouncedProcessor(simpleLogProcessor),
  getDebouncedProcessor(localJsonProcessor)
  // getDebouncedProcessor(s3Processor)
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
  // split on new line in case we are seeing parts of two messages
  const payloads = !payload ? [] : payload.toString().split('\n')
  payloads.forEach(processPayload)
})

function processPayload(payload) {
  const payloadTrimmed = payload.trim()
  const lastChar = payloadTrimmed[payloadTrimmed.length -1]
  const firstChar = payloadTrimmed[0]

  if (firstChar === '{' && lastChar === '}') {
    // this line has a complete message
    runProcessorsAndResetStates(payloadTrimmed)
  } else if (firstChar === '{') {
    // this line has just the start of a message (the next time we receive a payload event we should get the rest)
    inEvent = true
    buffer = payloadTrimmed
  } else if (inEvent) {
    // append anything else on this line to the buffer
    buffer += payload

    // check if we now have the full message
    if (lastChar == '}') {
      runProcessorsAndResetStates(buffer)
    }
  }
}

function runProcessorsAndResetStates(buffer) {
  const time = new Date()
  const messageId = uuidv4()

  console.log(`(${time}) received message ${messageId}`)

  enabledProcessor
    .forEach(processor => processor(buffer, time, messageId))

  buffer = ''
  inEvent = false
}
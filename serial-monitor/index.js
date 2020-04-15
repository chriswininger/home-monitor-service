/*
    serial-monitor
    Author: Chris Wininger
    Notes: A file called .env should be placed in the root directory. Do not check this file in!
        It should contain:  the "API_KEY" for the lambda and the SERIAL_PORT address
 */
require('dotenv').config()
const SerialPort = require('serialport')
const { throttle }  = require('lodash')
const lambdaToPostgres = require('./processors/lambda-to-portgres')
const localJson = require('./processors/local-json')
const s3Processor = require('./processors/s3')
const PORT = process.env.SERIAL_PORT
const BAUD_RATE = 57600

const DEBOUNCE_WAIT = process.env.DEBOUNCE_WAIT

const PROCESSOR_LAMBDA = "PROCESSOR_LAMBDA"
const PROCESSOR_LOCAL_JSON = "PROCESSOR_LOCAL_JSON"

const PROCESSOR_SELECTED = PROCESSOR_LOCAL_JSON

// check if the data is what we are looking for and send to aws when appropriate
const processData = async (data, timeReceived) => {
    if (isPacket(data)) {
        try {
            const obj = JSON.parse(data)
            console.log(`processing data (${PROCESSOR_SELECTED}): ${JSON.stringify(obj)}`)

            let result = null

            switch (PROCESSOR_SELECTED) {
                case PROCESSOR_LAMBDA:
                    const { data } = await lambdaToPostgres(obj)
                    result = data
                    break
                case PROCESSOR_LOCAL_JSON:
                    await localJson(obj)

                    // this should be on a separate schedule or we will get many s3 entries
                    await s3Processor(obj)
                    break
            }

            console.log(`success (${PROCESSOR_SELECTED}): ${JSON.stringify(obj)}, debounce: ${DEBOUNCE_WAIT}`)
        } catch (err) {
            console.warn('error: ' + err)
        }
    }
}

// debounce the method so we don't spam AWS, that thing aint cheap
const runProcessData = throttle(processData, DEBOUNCE_WAIT)

console.log(`Using port: ${PORT}, baud rate: ${BAUD_RATE}`)
// listen on the serial port for the temperature monitor
const port = new SerialPort(PORT, { baudRate: BAUD_RATE })
port.on('error', err => console.warn('error: ' + err))
port.on('data', payload => {
    const time = new Date(Date.now())
    console.log(`(${time}) received message: ${payload}`)
    runProcessData(payload, time)
})

function isPacket(data) {
    if (!data) {
        return false
    }

    if (data.indexOf("{") < 0) {
        return false
    }

    try {
        JSON.parse(data)

        return  true
    } catch (e) {
        console.error(e)
    }

    return false
}
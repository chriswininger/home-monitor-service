const { throttle }  = require('lodash')

module.exports = getDebouncedProcessor

function getDebouncedProcessor(processor) {
  const method = async (rawData, time, messageId) => {
    if (isPacket(rawData)) {
      try {
        console.log(`processing event (${processor.name}): ${messageId}`)

        const event = JSON.parse(rawData)
        await processor.run(event, time, messageId)

        console.log(`success (${processor.name}/${event.sensor}): ${messageId}`)
      } catch (err) {
        console.warn(`error (${processor.name}):  ${err}`)
      }
    }
  }

  const runProcessData = throttle(method, processor.debounceWait)

  return runProcessData
}

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
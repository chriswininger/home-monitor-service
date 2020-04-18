module.exports = {
  run: (payload, time, messageId) => {
    console.log(`${messageId}: ${JSON.stringify(payload)}`)
  },
  name: 'simple-log',
  debounceWait: process.env.PROCESSORS_SIMPLE_LOG || 100 // ms
}

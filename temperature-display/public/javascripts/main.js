(function main(window) {
  const timeBetweenRequests = 5000
  const appRoot = document.getElementById('app-root')
  const daysOfTheWeek = [
    'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat', 'Sun'
  ]

  let sensorsElementContainer = renderSensorWrapper()

  appRoot.appendChild(sensorsElementContainer)

  async function loop() {
    const oldSensorsContainer = sensorsElementContainer
    const sensorDataSets = await getSensorValues()
    const sensorElements = renderSensor(sensorDataSets)

    sensorsElementContainer = renderSensorWrapper()

    sensorElements.forEach(el => sensorsElementContainer.appendChild(el))

    appRoot.replaceChild(sensorsElementContainer, oldSensorsContainer)

    // run again
    setTimeout(loop, timeBetweenRequests)
  }

  // start the loop
  loop()

  async function getSensorValues() {
    const tempBaseURL = '/api/v1/last-temperature/'
    const coopSensorName = 'Chicken_Coop'
    const coopTempReqUrl = tempBaseURL + encodeURI(coopSensorName)

    const currentCoopTempDataResp = await fetch(coopTempReqUrl)

    if (currentCoopTempDataResp.status === 200) {
      let currentCoopTempData = null

      try {
        currentCoopTempData = await currentCoopTempDataResp.json()
      } catch (exNetError) {
        return Promise.reject(new Error(`Error requesting data: ${exNetError}`))
      }

      try {
        // success
        return Promise.resolve([JSON.parse(currentCoopTempData)])
      } catch(ex) {
        return Promise.reject(new Error(`Error Parsing Response: ${ex}\n\nBad Response: "${currentCoopTempData}"`))
      }
    }

    return Promise.reject(new Error('failed to get values for sensors'))
  }

  function renderSensor(sensorDataSets) {
    return sensorDataSets.map(sensor => {
      const sensorDiv = document.createElement('div')

      sensorDiv.classList.add('sensor')
      sensorDiv.classList.add('temp')

      sensorDiv.innerText = convertCelsiusToFahrenheit(sensor.temperature) + '°'

      sensorDiv.appendChild(renderSensorFooter(sensor))

      return sensorDiv
    })
  }

  function renderSensorFooter(sensor) {
    const timestampDiv = document.createElement("div")
    timestampDiv.classList.add("sensor-footer")
    timestampDiv.classList.add("sensor-timestamp")

    const persistedAt = new Date(sensor.persistedAt)
    const dayOfWeek = daysOfTheWeek[persistedAt.getDay()]

    timestampDiv.innerText = `Last Updated: ${dayOfWeek} ${persistedAt.toLocaleTimeString()}`

    return timestampDiv
  }

  function renderSensorWrapper() {
    const sensorsElementContainer = document.createElement('div')
    sensorsElementContainer.classList.add('sensors')

    return sensorsElementContainer
  }

  function convertCelsiusToFahrenheit(tempCelsius) {
    return ((tempCelsius * 9/5) + 32).toFixed(1)
  }
})(window)


(function main(window) {
  const timeBetweenRequests = 5000
  const appRoot = document.getElementById('app-root')

  let sensorsElementContainer = renderSensorWrapper()

  appRoot.appendChild(sensorsElementContainer)

  async function loop() {
    try {
      const oldSensorsContainer = sensorsElementContainer
      const sensorDataSets = await getSensorValues()
      const sensorElements = renderSensor(sensorDataSets)

      sensorsElementContainer = renderSensorWrapper()

      sensorElements.forEach(el => sensorsElementContainer.appendChild(el))

      appRoot.replaceChild(sensorsElementContainer, oldSensorsContainer)
    } catch (ex) {
      console.error(ex)
    }

    // run again
    setTimeout(loop, timeBetweenRequests)
  }

  // start the loop
  loop()

  async function getSensorValues() {
    const TEMPERATURES_URL = '/api/v1/last-temperatures'

    const currentCoopTempDataResp = await fetch(TEMPERATURES_URL)

    if (currentCoopTempDataResp.status === 200) {
      let currentCoopTempData = null

      try {
        currentCoopTempData = await currentCoopTempDataResp.json()
      } catch (exNetError) {
        return Promise.reject(new Error(`Error requesting data: ${exNetError}`))
      }

      try {
        const parsedResults = JSON.parse(currentCoopTempData)

        return Promise.resolve(parsedResults)
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
    const dayOfWeek = getDayOfTheWeek(persistedAt)

    const footerMessage = `${sensor.sensor} Last Updated: ${dayOfWeek} ${persistedAt.toLocaleTimeString()}`
    timestampDiv.innerText = footerMessage

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

  function getDayOfTheWeek(dtTime) {
    const daysOfTheWeek = [
      'EMPTY', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat', 'Sun'
    ]

    return daysOfTheWeek[dtTime.getDay()]
  }
})(window)


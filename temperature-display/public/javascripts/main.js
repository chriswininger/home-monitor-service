(function main(window) {
  const appRoot = document.getElementById('app-root')

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
    setTimeout(loop, 1000)
  }

  // start the loop
  loop()

  // console.log(JSON.stringify(sensorDataSets, null, 4))

  async function getSensorValues() {
    const tempBaseURL = '/api/v1/last-temperature/'
    const coopSensorName = 'Chicken Coop'
    const coopTempReqUrl = tempBaseURL + encodeURI(coopSensorName)

    const currentCoopTempDataResp = await fetch(coopTempReqUrl)

    if (currentCoopTempDataResp.status === 200) {
      const currentCoopTempData = await currentCoopTempDataResp.json()

      return Promise.resolve([JSON.parse(currentCoopTempData)])
    }

    return Promise.reject(new Error('failed to get values for sensors'))
  }

  function renderSensor(sensorDataSets) {
    return sensorDataSets.map(sensor => {
      const sensorDiv = document.createElement('div')

      sensorDiv.classList.add('sensor')
      sensorDiv.classList.add('temp')

      sensorDiv.innerText = convertCelsiusToFahrenheit(sensor.temperature) + '°'

      return sensorDiv
    })
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


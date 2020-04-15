const lambdaURL = ' https://o1lb60h0zh.execute-api.us-east-1.amazonaws.com/dev/home-monitor-service-log-temp'
const axios = require('axios')

/**
 * Send data to an aws lambda that persists it to postgres
 *
 *
 * @param obj the payload
 *
 * @returns {*|AxiosPromise}
 */
module.exports = {
  run: (obj) => {
    const opts = {
      url: `${lambdaURL}?temperature=${obj.temperature}&time_received=${encodeURIComponent(timeReceived)}`,
      method: 'post',
      headers: {'x-api-key': process.env.API_KEY}
    }

    return axios(opts)
  },
  name: 'lambda-to-postgres',
  debounceWait: process.env.PROCESS_LAMBDA_DEBOUNCE_WAIT || 180000 // 30 minutes
}


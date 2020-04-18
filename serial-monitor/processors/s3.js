const AWS = require('aws-sdk')

const region = process.env.AWS_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY_ID
const secretAccessKey = process.env.AWS_ACCESS_KEY_SECRET

const bucketName = 'home-energy-monitor-data'

AWS.config.update({ region })

module.exports = {
  run: (payload, time, messageId) => {
    const encodedName = encodeURI(payload.sensor)

    return new Promise((resolve, reject) => {
      const params = {
        Bucket: bucketName,
        Key: `${encodedName}/${Date.now()}-${messageId}`,
        Body: JSON.stringify(payload)
      }

      const s3 = new AWS.S3({
        accessKeyId,
        secretAccessKey
      })

      // Uploading files to the
      console.log('start s3 upload')
      s3.upload(params, function(err, data) {
        if (err) {
          return reject(err)
        }

        console.log(`File uploaded successfully: ${data.Location} for messageId: ${messageId}`);
        return resolve()
      });
    })
  },
  name: 's3',
  debounceWait: process.env.PROCESSOR_S3_DEBOUNCE_WAIT || 300000 // default to every 5 minutes
}

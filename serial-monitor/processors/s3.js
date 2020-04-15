const AWS = require('aws-sdk')

const region = process.env.AWS_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY_ID
const secretAccessKey = process.env.AWS_ACCESS_KEY_SECRET
const bucketName = 'home-energy-monitor-data'

AWS.config.update({ region })

module.exports = function s3(payload) {
  const params = {
    Bucket: bucketName,
    Key: encodeURI(payload.sensor) + '-' + Date.now(),
    Body: JSON.stringify(payload)
  }

  console.log('try to send to s3')
  return new Promise((resolve, reject) => {
    const s3 = new AWS.S3({
      accessKeyId,
      secretAccessKey
    })

    // Uploading files to the bucket
    s3.upload(params, function(err, data) {
      if (err) {
        return reject(err)
      }

      console.log(`File uploaded successfully. ${data.Location}`);
      return resolve()
    });
  })
}
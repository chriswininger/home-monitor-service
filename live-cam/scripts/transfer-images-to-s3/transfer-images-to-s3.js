const fs = require('fs/promises')
const path = require('path')
const AWS = require('aws-sdk')

const args = process.argv.slice(2);

const processedArgs = processArgs(args)

const bucketName = 'coop-cam-uploads'

const SCRIPT_START_TIME = Date.now()

// I leave a window of time after creation to make sure there is no chance that Motion is still touching the file
const HOW_LONG_TO_WAIT_BEFORE_UPLOADING_MS = 60000

const NEWEST_UPLOAD_TIME = new Date(SCRIPT_START_TIME - HOW_LONG_TO_WAIT_BEFORE_UPLOADING_MS)

const REGION = 'us-east-1'
const ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
const SECRET_ACCESS_KEY = process.env.AWS_ACCESS_KEY_SECRET

const TIME_EXCLUSION_CUT_OFF_HOUR = 19

AWS.config.update({ REGION })

main()
  .then(() => console.info('success'))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })

async function main() {
  const matchingFiles = await getRecentJpegFiles()

  console.info(`found "${matchingFiles.length}" files to upload`)

  for (const file of matchingFiles) {
    if (isUploadIncluded()) {
      await uploadFileToS3(file.fullPath)
      console.info(`uploaded ${file.fullPath}`)
    } else {
      console.info(`skipping upload due to time of night exclusion ${file.fullPath}`)
    }

    if (processedArgs.delete) {
      await fs.unlink(file.fullPath)
      console.log(`deleted file ${file.fullPath}`)
    }
  }
}

async function getRecentJpegFiles() {
  const directoryPath = processedArgs.directory

  const dir = await fs.opendir(directoryPath)

  const matchingFilePaths = []

  for await (const fileEntry of dir) {
    const fileName = fileEntry.name

    const fullPath = path.resolve(directoryPath, fileName)
    const { birthtime } =  await fs.stat(fullPath)

    if (isJpeg(fullPath) && isOldEnough(birthtime)) {
      matchingFilePaths.push({
        fullPath,
        fileName,
        birthtime
      })
    }
  }

  return matchingFilePaths
}

async function uploadFileToS3(fullPath) {
  const currentDate = new Date()
  const year = currentDate.getFullYear()
  const month = `${currentDate.getMonth() + 1}`.padStart(2,'0')
  const date = `${currentDate.getDate()}`.padStart(2, '0')

  const fileName = path.basename(fullPath)
  const safeEncodedName = encodeURI(fileName)
  const s3FullPath = `${year}-${month}-${date}/${safeEncodedName}`

  const fileContent = await fs.readFile(fullPath);

  const params = {
    Bucket: bucketName,
    Key: s3FullPath,
    Body: fileContent,
    ACL:'public-read', // these will be publicly readable, nice for now...
    Tagging: 'shouldExpire=true' // used by lifecycle rule to know which files expire
  }

  const s3 = new AWS.S3({
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY
  })

  return new Promise((resolve, reject) => {
    s3.upload(params, function(err, data) {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

// TODO (CAW) -- It would be better if this was based on created_at of file rather than current time on server
function isUploadIncluded() {
  if (!processedArgs.isTimeExclusionFlagSet) {
    return true
  }

  const currentTime = Date.now()

  return currentTime.getHours() < TIME_EXCLUSION_CUT_OFF_HOUR
}

function processArgs(args) {
  const isDeleteFlag = (arg) => arg === '--delete'
  const isTimeExclusionFlag = (arg) => arg === '--time-exclusion'

  if (args.length > 3 || args.length < 1) {
    console.error('invalid args')
    printUsage()
    process.exit(1)
  }

  const processedArgs = {
    delete: false,
    isTimeExclusionFlagSet: false,
  }

  args.forEach(arg => {
    if (isDeleteFlag(arg)) {
      processedArgs.delete = true
    } else if (isTimeExclusionFlag(arg)) {
      processedArgs.isTimeExclusionFlagSet = true
    } else {
      processedArgs.directory = path.resolve(arg)
    }
  })

  return processedArgs
}

function printUsage() {
  console.info('usage -> node ./transfer-images-to-s3 [--delete] [--time-exclusion] pathToFolder')
  console.info(`
    --delete: deletes images once uploaded
    --time-exclusion: excludes images after dark (7:00 PM EST). When used in conjuction with delete this means they will
      be deleted and not uploaded
  `)
}

function isJpeg(filePath) {
  const extension = path.extname(filePath).toLowerCase()

  return extension === '.jpg' || extension === '.jpeg'
}

function isOldEnough(birthtime) {
  return birthtime <= NEWEST_UPLOAD_TIME
}

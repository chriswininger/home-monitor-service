const ID = 'available-time-periods'
const BASE_URL = 'http://coop-cam-uploads.s3-website-us-east-1.amazonaws.com/'

let mainEl
let imagePreview

main()

async function main() {
  const opt = {
    mode: 'cors'
  }
  const itemsXML = await fetch('http://coop-cam-uploads.s3.amazonaws.com/?list-type=2', opt)
    .then(resp => {
      return resp.text()
    })
    .catch(error => console.error(error))


  console.log('---FULL XML---')
  console.log(itemsXML)
  console.log('---------------')

  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(itemsXML,"text/xml")
  const entries = xmlDoc.getElementsByTagName('ListBucketResult')
  const contents = entries[0].getElementsByTagName('Contents')

  mainEl = document.getElementById(ID)

  const motionCaptures = getListOfValidMotionCapturesFromXmlContents(contents)
  const groupedByFolders = groupByFolder(motionCaptures)

  console.log(JSON.stringify(groupedByFolders, null, 4))

  groupedByFolders.forEach(folder => {
    const capturesInFolder = folder.motionCaptures
    const folderName = folder.name

    const folderWrapper = document.createElement('div')
    folderName.className = 'folder-wrapper'

    const folderHeader = document.createElement('div')
    folderHeader.className = 'folder-header'
    folderHeader.textContent = folderName + ' -- ' + capturesInFolder.length + ' images'

    const folderList = buildMotionCaptureList(capturesInFolder)

    folderWrapper.appendChild(folderHeader)
    folderWrapper.appendChild(folderList)

    mainEl.append(folderWrapper)
  })
}

function buildMotionCaptureList(capturesInFolder)
{
  const list = document.createElement('ul')
  list.className = 'folder-list'

  capturesInFolder.forEach(motionCapture => {
    const link = buildLink(motionCapture)

    const container = buildLinkContainer(link)

    list.appendChild(container)
  })

  return list
}

function groupByFolder(motionCaptures) {
  const foldersByKey = {}
  const folderList = []

  motionCaptures.forEach(capture => {
    const folderKey = capture.folder

    if (!foldersByKey[folderKey]) {
      foldersByKey[folderKey] = {
        name: folderKey,
        motionCaptures: []
      }

      folderList.push(foldersByKey[folderKey])
    }

    const folder = foldersByKey[folderKey]
    folder.motionCaptures.push(capture)
  })

  return folderList
}

function getListOfValidMotionCapturesFromXmlContents(contents) {
  const keys = []
  for (let i = 0; i < contents.length; i++) {
    const content = contents[i]

    const keyText = content.getElementsByTagName('Key')[0].textContent

    const url = `${BASE_URL}${keyText}`

    const folder = keyText.split('/')[0]

    if (isJpeg(keyText)) {
      keys.push({
        keyText,
        url,
        folder
      })
    }
  }

  return keys.sort()
}

function isJpeg(key) {
  return key.indexOf('.jpg') > 0
}

function buildLink(motionCapture) {
  const keyText = motionCapture.keyText

  const onClick = (e) => {
    e.preventDefault();
    showImagePreview(motionCapture.url)
  }

  const link = document.createElement('a')
  link.setAttribute('href', motionCapture.url)
  link.text = keyText + ' -- ' + getTimeFromKey(keyText)
  link.onclick = onClick

  return link
}

function buildLinkContainer(link) {
  const container = document.createElement('li')
  container.appendChild(link)

  return container
}

function showImagePreview(imgSrc) {
  removeImagePreview()

  imagePreview = buildImagePreview(imgSrc)

  mainEl.append(imagePreview)
}

function removeImagePreview() {
  if (imagePreview) {
    mainEl.removeChild(imagePreview)
    imagePreview = null
  }
}

function buildImagePreview(imgSrc) {
  const imgContainer = document.createElement('div')
  imgContainer.className = 'preview-image-container'
  imgContainer.id = 'preview-image'

  const imgContainerTopBar = buildImageContainerTopBar()

  const img = document.createElement('img')
  img.setAttribute('src', imgSrc)
  img.className = 'preview-image-image'

  imgContainer.appendChild(imgContainerTopBar)
  imgContainer.appendChild(img)

  return imgContainer
}

function buildImageContainerTopBar() {
  const onCloseClick = () => removeImagePreview()

  const imgContainerTopBar = document.createElement('div')
  imgContainerTopBar.className = 'preview-image-top-bar'

  const imgContainerTopBarX = document.createElement('div')
  imgContainerTopBarX.className = 'preview-image-top-bar-x'
  imgContainerTopBarX.textContent = '-X-'
  imgContainerTopBarX.onclick = onCloseClick

  imgContainerTopBar.appendChild(imgContainerTopBarX)

  return imgContainerTopBar
}

function getTimeFromKey(key) {
  if (isValidCaptureWithStamp(key)) {
    const file = key.split('/')[1]
    const stamp = file.split('-')[1]

    const year = stamp.substr(0, 4)
    const month = stamp.substr(4, 2)
    const date = stamp.substr(6, 2)
    const hour = stamp.substr(8, 2)
    const min = stamp.substr(10, 2)
    const second = stamp.substr(12, 2)

    const dateString = `${year}-${month}-${date} ${hour}:${min}:${second}`

    return new Date(dateString).toString()
  } else {
    return '[INVALID DATE]'
  }
}

function isValidCaptureWithStamp(key) {
  const isValidCaptureWithStampExp = /[0-9]*-[0-9]{14}-[0-9]*./i

  return !!key.match(isValidCaptureWithStampExp)
}
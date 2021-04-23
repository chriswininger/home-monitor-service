const ID = 'available-time-periods'
const BASE_URL = 'http://coop-cam-uploads.s3-website-us-east-1.amazonaws.com/'

let mainEl
let imagePreview

let orderedListOfImageLinks = [];

main()

async function main() {
  const opt = {
    mode: 'cors'
  }
  const itemsXML = await fetch('http://coop-cam-uploads.s3.amazonaws.com?list-type=2&start-after=2020-10-30/147-20201130120319-18.jpg', opt)
    .then(resp => {
      return resp.text()
    })
    .catch(error => console.error(error))


  console.log('---FULL XML---')
  console.log(itemsXML)
  console.log('---------------')

  // const parser = new DOMParser()
  // const xmlDoc = parser.parseFromString(itemsXML,"text/xml")
  // const entries = xmlDoc.getElementsByTagName('ListBucketResult')
  // const contents = entries[0].getElementsByTagName('Contents')
  //
  mainEl = document.getElementById(ID)
  //
  // const motionCaptures = getListOfValidMotionCapturesFromXmlContents(contents)
  const motionCaptures = await getListOfCaptures()
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

    const link = buildLink(motionCapture);

    const container = buildLinkContainer(link);

    list.appendChild(container);
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
    orderedListOfImageLinks.push(capture.url)
  })

  return folderList
}

function getListOfValidMotionCapturesFromXmlContents(contents) {
  const keys = []
  for (let i = 0; i < contents.length; i++) {
    const content = contents[i]

    const keyText = content.getElementsByTagName('Key')[0].textContent

    if (isJpeg(keyText)) {

      const url = `${BASE_URL}${keyText}`

      const folder = keyText.split('/')[0]

      const extractedDateTime = getTimeFromKey(keyText)


      keys.push({
        keyText,
        url,
        folder,
        extractedDateTime
      })
    }
  }

  return keys.sort((motionCaptureA, motionCaptureB) => {
    return motionCaptureB.extractedDateTime - motionCaptureA.extractedDateTime
  })
}

function isJpeg(key) {
  return key.indexOf('.jpg') > 0
}

function buildLink(motionCapture) {
  const keyText = motionCapture.keyText
  const timeStampText = motionCapture.extractedDateTime ?
    motionCapture.extractedDateTime.toLocaleTimeString() :
    '[INVALID DATE]'

  const onClick = (e) => {
    e.preventDefault();
    showImagePreview(motionCapture.url)
  }

  const link = document.createElement('a')
  link.setAttribute('href', motionCapture.url);
  link.text = keyText + ' -- ' + timeStampText
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
  const imgContainerBottomBar = buildImageContainerBottomBar(imgSrc);

  const img = document.createElement('img')
  img.setAttribute('src', imgSrc)
  img.className = 'preview-image-image'

  imgContainer.appendChild(imgContainerTopBar)
  imgContainer.appendChild(img)
  imgContainer.appendChild(imgContainerBottomBar);

  return imgContainer
}

function buildImageContainerTopBar() {
  const onCloseClick = () => removeImagePreview()

  const imgContainerTopBar = document.createElement('div')
  imgContainerTopBar.className = 'preview-image-top-bar'

  const imgContainerTopBarX = document.createElement('div')
  imgContainerTopBarX.className = 'preview-image-top-bar-x preview-image-button'
  imgContainerTopBarX.textContent = '-X-'
  imgContainerTopBarX.onclick = onCloseClick

  imgContainerTopBar.appendChild(imgContainerTopBarX)

  return imgContainerTopBar
}

function buildImageContainerBottomBar(imgSrc)  {
  const currentNdx = orderedListOfImageLinks.findIndex((entrySrc) => entrySrc === imgSrc);
  const previousNdx = currentNdx - 1;
  const nextNdx = currentNdx + 1;

  const onPreviousClick = () => {
    if (previousNdx >= 0) {
      const previousImage = orderedListOfImageLinks[previousNdx];
      showImagePreview(previousImage);
    }
  };

  const onNextClick = () => {
    if (nextNdx < orderedListOfImageLinks.length) {
      const nextImage = orderedListOfImageLinks[nextNdx];
      showImagePreview(nextImage);
    }
  };

  const imgContainerBottomBar = document.createElement('div');
  imgContainerBottomBar.className = 'preview-image-bottom-bar';

  const imgContainerPrevious = document.createElement('div');
  imgContainerPrevious.className = 'preview-image-previous-button preview-image-button';
  imgContainerPrevious.textContent = '<<';
  imgContainerPrevious.onclick = onPreviousClick;

  const imgContainerNext = document.createElement('div');
  imgContainerNext.className = 'preview-image-next-button preview-image-button';
  imgContainerNext.textContent = '>>';
  imgContainerNext.onclick = onNextClick;

  imgContainerBottomBar.appendChild(imgContainerPrevious);
  imgContainerBottomBar.appendChild(imgContainerNext);

  return imgContainerBottomBar;
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

    return new Date(dateString)
  } else {
    return null
  }
}

async function getListOfCaptures() {
  const responses = await getXmlUntilNotTruncated()

  let allMotionCaptures = []

  for (let i = 0; i < responses.length; i++) {
    const respXml = responses[i]

    const contents = getContents(respXml)

    allMotionCaptures = [
      ...allMotionCaptures,
      ...getListOfValidMotionCapturesFromXmlContents(contents)
    ]
  }

  return allMotionCaptures
}

async function getXmlUntilNotTruncated() {
  let xml = await getXml()

  const allResponses = [xml]

  while (isTruncated(xml)) {
    const lastKey = findLastKey(xml)

    xml = await getXml(lastKey)
    allResponses.push(xml)
  }

  return allResponses
}

async function getXml(startAfter) {
  const baseUrl = 'http://coop-cam-uploads.s3.amazonaws.com?list-type=2'
  const queryParams = '&start-after='

  const opt = {
    mode: 'cors'
  }

  let url = baseUrl
  if (startAfter) {
    url += queryParams + startAfter
  }

  return fetch(url, opt)
    .then(resp => {
      return resp.text()
    })
    .catch(error => console.error(error))
}

function isTruncated(xml) {
  const entries = getXmlDocBucketResults(xml)
  const truncationKey = entries[0].getElementsByTagName('IsTruncated')[0].textContent

  return truncationKey === 'true'
}

function findLastKey(xml) {
  const entries = getXmlDocBucketResults(xml)
  const contents = entries[0].getElementsByTagName('Contents')

  const lastNdx = contents.length - 1

  const lastEntry = contents[lastNdx]

  return lastEntry.getElementsByTagName('Key')[0].textContent
}

function getXmlDocBucketResults(xml) {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(xml,"text/xml")

  return xmlDoc.getElementsByTagName('ListBucketResult')
}

function getContents(xml) {
  const entries = getXmlDocBucketResults(xml)
  return entries[0].getElementsByTagName('Contents')
}

function isValidCaptureWithStamp(key) {
  const isValidCaptureWithStampExp = /[0-9]*-[0-9]{14}-[0-9]*./i

  return !!key.match(isValidCaptureWithStampExp)
}

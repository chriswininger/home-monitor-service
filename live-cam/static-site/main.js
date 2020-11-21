const ID = 'available-time-periods'

main()

async function main() {
  const opt = {
    mode: 'cors'
  }
  const itemsXML = await fetch('http://coop-cam-uploads.s3.amazonaws.com/?list-type=2', opt)
    .then(resp => {
      console.log(resp)
      return resp.text()
    })
    .catch(error => console.error(error))


  console.log(itemsXML)

  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(itemsXML,"text/xml")
  const entries = xmlDoc.getElementsByTagName('ListBucketResult')
  const baseUrl = entries[0].getAttribute('xmlns')
  const contents = entries[0].getElementsByTagName('Contents')

  const keys = []
  for (let i = 0; i < contents.length; i++) {
    const content = contents[i]

    const keyText = content.getElementsByTagName('Key')[0].textContent

    keys.push(keyText)
  }

  const mainEl = document.getElementById(ID)

  keys.sort().forEach(key => {
    if (key.indexOf('.jpg') < 0 && key.indexOf('.jpeg') < 0) {
      return
    }

    const link = document.createElement('a')
    link.setAttribute('href', '/' + key)
    link.text = key

    const p = document.createElement('p')
    p.appendChild(link)

    mainEl.appendChild(p)

  })


  console.log(entries)


  // https://coop-cam-uploads.s3.amazonaws.com/2020-10-21/Yakov-Smirnoff21.jpg

}

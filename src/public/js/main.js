function getCookie (cname) {
  let name = `${cname}=`
  let decodedCookie = decodeURIComponent(document.cookie)
  let ca = decodedCookie.split(';')
  for (let content of ca) {
    content = content.trim()
    if (content.indexOf(name) === 0) {
      return content.substring(name.length, content.length)
    }
  }
  return ''
}

function setCookie (cname, cvalue, exdays) {
  let date = new Date()
  date.setTime(date.getTime() + (exdays*24*60*60*1000))
  let expires = `expires=${date.toUTCString()}`
  document.cookie = `${cname}=${cvalue};${expires};path=/`
}

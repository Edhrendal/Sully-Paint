const form = document.querySelector('#loginForm')
const input = document.querySelector('#login')

form.addEventListener('submit', (e) => {
  e.preventDefault()

  let login = input.value
  setCookie('login', login, 1)

  document.location.href = '/paint'
})

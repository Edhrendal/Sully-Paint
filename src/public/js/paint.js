/* global io getCookie */
/* eslint no-undef: "error" */

const canvas = document.querySelector('#canvas')
const board = canvas.getContext('2d')
const inputColorBrush = document.querySelector('#colorBrush')
const inputWidthBrush = document.querySelector('#widthBrush')
let usersList = document.querySelector('#users_list')

// Settings
board.lineJoin = 'round'
board.lineCap = 'round'
board.strokeStyle = inputColorBrush.value
board.lineWidth = inputWidthBrush.value

fetch('static/json/connection.json')
  .then(function(response) {
    return response.json();
  })
  .then(function (json) {
    return `${json.ip_address}:${json.port}`
  })
  .then(function (connectionString) {
    const socket = io.connect(connectionString);

    function onmousemove (event) {
      socket.emit('drawing', {x: event.offsetX, y: event.offsetY, color: board.strokeStyle, width: board.lineWidth})
    }
    canvas.addEventListener('mousedown', function (event) {
      canvas.addEventListener('mousemove', onmousemove)
    })
    canvas.addEventListener('mouseup', function (event) {
      socket.emit('stopdrawing')
      canvas.removeEventListener('mousemove', onmousemove)
    })
    canvas.addEventListener('mouseleave', function (event) {
      socket.emit('stopdrawing')
      canvas.removeEventListener('mousemove', onmousemove)
    })

    // Draw
    socket.on('draw', function (data) {
      let color = board.strokeStyle
      let width = board.lineWidth

      board.strokeStyle = data.color
      board.lineWidth = data.width
      board.beginPath()
      board.moveTo(data.last.x, data.last.y)
      board.lineTo(data.new.x, data.new.y)
      board.stroke()

      board.strokeStyle = color
      board.lineWidth = width
    })

    // Restore draw
    socket.on('restoreDraw', function (drawingStore) {
      drawingStore.forEach(function (data) {
        let color = board.strokeStyle
        let width = board.lineWidth

        board.strokeStyle = data.color
        board.lineWidth = data.width
        board.beginPath()
        board.moveTo(data.last.x, data.last.y)
        board.lineTo(data.new.x, data.new.y)
        board.stroke()

        board.strokeStyle = color
        board.lineWidth = width
      })
    })

    // Color selection
    inputColorBrush.addEventListener('change', function () {
      canvas.removeEventListener('mousemove', onmousemove)
      board.strokeStyle = inputColorBrush.value
      socket.emit('changeUserPencilColor', inputColorBrush.value)
    })

    // Width selection
    inputWidthBrush.addEventListener('change', function () {
      canvas.removeEventListener('mousemove', onmousemove)
      board.lineWidth = inputWidthBrush.value
    })

    // CHATBOX
    socket.emit('connectionToChannel', user)

    let chat = document.querySelector('#chat')
    const formChatbox = document.querySelector('#sendMessage')
    const inputChatbox = document.querySelector('#message')

    formChatbox.addEventListener('submit', (e) => {
      e.preventDefault()

      let message = inputChatbox.value
      inputChatbox.value = ''
      if (message.trim() !== '') {
        socket.emit('send', { user, message })
      }
    })

    socket.on('connectedToChannel', (user) => {
      let date = new Date()
      // Format of time
      let hours = date.getHours()
      hours = hours < 10 ? `0${hours}` : hours
      let minutes = date.getMinutes()
      minutes = minutes < 10 ? `0${minutes}` : minutes
      date = `${date.toDateString()} - ${hours}:${minutes}`
      chat.innerHTML =
        `${chat.innerHTML}
        <div class="connection label label-success">
            ${user} a rejoint le chat le ${date}
        </div>`
    })

    socket.on('displayUsersList', (usersStore) => {
      usersList.innerHTML = ""
      for (var user in usersStore) {
        let userColor = typeof usersStore[user].color !== 'undefined'
        usersList.innerHTML =
          `${usersList.innerHTML}
          <li id="user_${user}">
            <span id="color_user_${user}" class="pencil-color"></span>
            ${user} 
          </li>`

        if (userColor) {
          changePencilColor(usersStore[user])
        }
      }
    })

    socket.on('changeUserCircleColor', (user) => {
      changePencilColor(user)
    })

    socket.on('write', (data) => {
      let date = new Date()
      // Format of time
      let hours = date.getHours()
      hours = hours < 10 ? `0${hours}` : hours
      let minutes = date.getMinutes()
      minutes = minutes < 10 ? `0${minutes}` : minutes
      let seconds = date.getSeconds()
      seconds = seconds < 10 ? `0${seconds}` : seconds
      date = `[${hours}:${minutes}:${seconds}]`
      // Display
      chat.innerHTML =
        `${chat.innerHTML}
        <div class="message">
            <span class="date">${date}</span>
            <span class="user">${data.user} : </span>
            ${data.message}
        </div>`

      // Scroll bar bottom position
      chat.scrollTop = chat.scrollHeight
    })
  })

function changePencilColor (user) {
  let userCircle = document.querySelector(`#color_user_${user.name}`)
  userCircle.style['background-color'] = user.color
}
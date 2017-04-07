'use strict'

const http = require('http')
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const fs = require('fs')
const escape = require('escape-html')
let io = require('socket.io')

const connectionFile = JSON.parse(fs.readFileSync(path.join(__dirname, './public/json/connection.json'), 'utf8'))
const port = connectionFile.port
const loginPath = '/'
// Application
let app = express()
// -> POST - BodyParser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
// -> Session
app.use(session({
  secret: 'paint',
  resave: false,
  saveUninitialized: true
}))
app.use((req, res, next) => {
  let user = req.session.user
  if (!user) {
    req.session.user = {}
  }
  next()
})
// -> Views parameters
app.use('/static', express.static(path.join(__dirname, './public')))
app.set('views', path.join('./src', './views'))
app.set('view engine', 'pug')

let server = http.Server(app)
io = io.listen(server)

// MiddleWares
// -> Redirect to Login Page not logged users but to Paint for logged users
let loginRedirection = (req, res, next) => {
  let user = req.session.user
  let url = req.url
  let redirectToLoginPage = true

  // User is logged ; don't need to redirect to login page
  if (typeof user !== 'undefined' && typeof user.login !== 'undefined' && user.login.trim() !== '') {
    redirectToLoginPage = false
  }

  // Redirection
  if (redirectToLoginPage) {
    if (url !== loginPath) {
      return res.redirect(loginPath)
    }
  } else { // Logged user
    // Don't need to stay on login Page if logged
    if (url === loginPath) {
      return res.redirect('/paint')
    }
  }

  next()
}

// STORES
let usersStore = []
let drawingStore = []

// ROUTING
app.get(loginPath, [loginRedirection], (req, res) => {
  res.render('index', {
    title: 'Authentification'
  })
})

app.post(loginPath, (req, res) => {
  req.session.user.login = req.body.login
  res.redirect('/paint')
})

app.get('/paint', [loginRedirection], (req, res) => {
  res.render('paint', {
    title: 'Détente',
    login: req.session.user.login
  })
})

// SOCKET
io.sockets.on('connection', (socket) => {
  // Connection
  socket.on('connectionToChannel', user => {
    user = user.trim()
    
    // Check if user is already connected
    if (typeof usersStore[user] === 'undefined') {
      usersStore[user] = user
      let date = new Date()
      // Format of time
      let hours = date.getHours()
      hours = hours < 10 ? `0${hours}` : hours
      let minutes = date.getMinutes()
      minutes = minutes < 10 ? `0${minutes}` : minutes
      date = `${date.toDateString()} - ${hours}:${minutes}`
      console.log(`${date}: ${user} is connected.`)

      io.sockets.emit('connectedToChannel', user)
    }

    io.sockets.emit('restoreDraw', drawingStore)
  })

  // Chatbox
  socket.on('send', data => {
    let message = escape(data.message).trim()
    let user = escape(data.user).trim()
    io.sockets.emit('write', { message, user })
  })

  // Paint
  socket.on('drawing', data => {
    let last = socket.lastPoint || data
    let draw = {
      last,
      new: {
        x: data.x,
        y: data.y
      },
      color: data.color,
      width: data.width
    }
    io.sockets.emit('draw', draw)
    drawingStore.push(draw)

    socket.lastPoint = {
      x: data.x,
      y: data.y
    }
  })

  socket.on('stopdrawing', _ => {
    delete socket.lastPoint
  })
})

server.listen(port, _ => {
  console.log(`Server is listening to port ${port}.`)
})

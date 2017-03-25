'use strict'

const http = require('http')
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs')
const escape = require('escape-html')
let io = require('socket.io')

const connectionFile = JSON.parse(fs.readFileSync(path.join(__dirname, './public/json/connection.json'), 'utf8'))
const port = connectionFile.port
// Application
let app = express()
// -> POST - BodyParser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
// -> Views parameters
app.use('/static', express.static(path.join(__dirname, './public')))
app.set('views', path.join('./src', './views'))
app.set('view engine', 'pug')

let server = http.Server(app)
io = io.listen(server)

// STORES
let drawingStore = []

// ROUTING
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Authentification'
  })
})

app.post('/', (req, res) => {
  let login = request.body.login
  res.redirect('/paint')
})

app.get('/paint', (req, res) => {
  res.render('paint', {
    title: 'Détente'
  })
})

// SOCKET
io.sockets.on('connection', (socket) => {
  // Connection
  socket.on('connectionToChannel', author => {
    let date = new Date()
    // Format of time
    let hours = date.getHours()
    hours = hours < 10 ? `0${hours}` : hours
    let minutes = date.getMinutes()
    minutes = minutes < 10 ? `0${minutes}` : minutes
    date = `${date.toDateString()} - ${hours}:${minutes}`
    console.log(`${date}: ${author} is connected.`)
    io.sockets.emit('connectedToChannel', author.trim())
    io.sockets.emit('restoreDraw', drawingStore)
  })

  // Chatbox
  socket.on('send', data => {
    let message = escape(data.message).trim()
    let author = escape(data.author).trim()
    io.sockets.emit('write', { message, author })
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
  console.log(`Server is listening to port ${port}`)
})

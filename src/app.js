'use strict'

const http = require('http')
const path = require('path')
const express = require('express')
const escape = require('escape-html')
let io = require('socket.io')

const port = 3000
let app = express()
app.use('/static', express.static(path.join(__dirname, './public')))
app.set('views', path.join('./src', './views'))
app.set('view engine', 'pug')

let server = http.Server(app)
io = io.listen(server)

// ROUTING
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Authentification'
  })
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
    console.log(`${author} is connected.`)
    io.sockets.emit('connectedToChannel', author.trim())
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
    io.sockets.emit('draw', {
      last,
      new: {
        x: data.x,
        y: data.y
      },
      color: data.color,
      width: data.width
    })

    socket.lastPoint = {
      x: data.x,
      y: data.y
    }
  })

  socket.on('stopdrawing', _ => {
    delete socket.lastPoint
  })
})

server.listen(port)

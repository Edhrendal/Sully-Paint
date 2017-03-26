# Sully-Paint
This project provides a paint used by several users at the same time. Use it as a local application for your company or as a public application on your website for all visitors.
This project is based on [node.js](https://nodejs.org) and [socket.io](http://socket.io/).

# Installation
* Install npm dependancies (make sure you have npm) `npm update`.
* Change ip address for socket.io connection on the client side.
```json
// src/public/json/connection.json
{
  "ip_address": "SERVER_IP_ADDRESS",
  "port": "PORT"
}
```
* Start the server `npm start`.
* With your web browser (**NOT IE**), go to `http:\\SERVER_IP_ADDRESS:PORT`.

# Usages
This project is based on socket.io for the communication between the server and the client. When the client wants to make lines on the paint (canvas) or send a message to the others with the chat, he sends a specific message to the server through socket.io. Server sends the response to all clients in order to get the draw or the message on the chat.

# Dependencies
* [express](https://github.com/expressjs/express)
* [pug](https://github.com/pugjs/pug)
* [socket.io](https://github.com/socketio/socket.io)
* [body-parser](https://github.com/expressjs/body-parser)
* [escape.html](https://github.com/component/escape-html)
* [express-session](https://github.com/expressjs/session)
* [eslint](https://github.com/eslint/eslint) (dev dependency - format Standard)

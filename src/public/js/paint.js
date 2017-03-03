const socket = io.connect('localhost:3000');
const canvas = document.querySelector('#canvas');
const board = canvas.getContext('2d');
const inputColorBrush = document.querySelector('#colorBrush');
const inputWidthBrush = document.querySelector('#widthBrush');

// Settings
board.lineJoin = 'round';
board.lineCap = 'round';
board.strokeStyle = inputColorBrush.value;
board.lineWidth = inputWidthBrush.value;

function onmousemove (event) {
  socket.emit('drawing', {x: event.offsetX, y: event.offsetY, color: board.strokeStyle, width: board.lineWidth})
}
canvas.addEventListener('mousedown', function (event) {
  canvas.addEventListener('mousemove', onmousemove)
});
canvas.addEventListener('mouseup', function (event) {
  socket.emit('stopdrawing');
  canvas.removeEventListener('mousemove', onmousemove)
});
canvas.addEventListener('mouseleave', function (event) {
  socket.emit('stopdrawing');
  canvas.removeEventListener('mousemove', onmousemove)
});

// dessin
socket.on('draw', function (data) {
  let color = board.strokeStyle;
  let width = board.lineWidth;

  board.strokeStyle = data.color;
  board.lineWidth = data.width;
  board.beginPath();
  board.moveTo(data.last.x, data.last.y);
  board.lineTo(data.new.x, data.new.y);
  board.stroke();

  board.strokeStyle = color;
  board.lineWidth = width
});

// dessin
socket.on('restoreDraw', function (drawingStore) {
  drawingStore.forEach(function(data) {
    let color = board.strokeStyle;
    let width = board.lineWidth;

    board.strokeStyle = data.color;
    board.lineWidth = data.width;
    board.beginPath();
    board.moveTo(data.last.x, data.last.y);
    board.lineTo(data.new.x, data.new.y);
    board.stroke();

    board.strokeStyle = color;
    board.lineWidth = width
  });
});

// Color selection
inputColorBrush.addEventListener('change', function () {
  canvas.removeEventListener('mousemove', onmousemove);
  board.strokeStyle = inputColorBrush.value
});

// Width selection
inputWidthBrush.addEventListener('change', function () {
  canvas.removeEventListener('mousemove', onmousemove);
  board.lineWidth = inputWidthBrush.value
});

// CHATBOX
let author = getCookie('login');
socket.emit('connectionToChannel', author);

let chatbox = document.querySelector('#chatbox');
const formChatbox = document.querySelector('#sendMessage');
const inputChatbox = document.querySelector('#message');

formChatbox.addEventListener('submit', (e) => {
  e.preventDefault();

  let message = inputChatbox.value;
  inputChatbox.value = '';
  if (message.trim() !== '') {
    socket.emit('send', { author, message })
  }
});

socket.on('connectedToChannel', (author) => {
  let date = new Date();
  date = `${date.toDateString()} - ${date.getHours()}:${date.getMinutes()}`;
  chatbox.innerHTML =
    `${chatbox.innerHTML}
        <div class="connection label label-success">
            ${author} a rejoint le chat le ${date}
        </div>`
});

socket.on('write', (data) => {
  if (chatbox.scrollTop === chatbox.scrollHeight) {
    console.log('On descend !')
  }
  let date = new Date();
  // Format of time
  let hours = date.getHours();
  hours = hours < 10 ? `0${hours}` : hours;
  let minutes = date.getMinutes();
  minutes = minutes < 10 ? `0${minutes}` : minutes;
  let seconds = date.getSeconds();
  seconds = seconds < 10 ? `0${seconds}` : seconds;
  date = `[${hours}:${minutes}:${seconds}]`;
  // Display
  chatbox.innerHTML =
    `${chatbox.innerHTML}
        <div class="message">
            <span class="date">${date}</span>
            <span class="author">${data.author} : </span>
            ${data.message}
        </div>`;
  // Scroll bar bottom position

  chatbox.scrollTop = chatbox.scrollHeight
});

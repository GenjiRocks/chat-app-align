const path = require("path");
const express = require('express')
const http = require('http')
const socketio = require('socket.io')



const app = express()

const server = http.createServer(app) //http server that wraps the express app
const io = socketio(server) //initializing socket io


const port = process.env.PORT || 3000

//serving the static files
const publicPath = path.join(__dirname, './public')
app.use(express.static(publicPath))

let count = 0;

// sets up an event listener for new client connections(every refresh creates a new connection)
io.on('connection', (socket) => { //socket is an object
   console.log('new socket connection');
   socket.emit('countUpdated', count) //send inital count to the clients
   socket.on('increment', () => { //event listener for increment event
       count++;
       io.emit('countUpdated', count) //send updated count to all clients || if u put socket.emit only send to single client
   })
})




server.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
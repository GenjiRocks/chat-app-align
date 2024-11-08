const path = require("path");
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const { log } = require("console");
const { generateMessage, generateLocationMessage } = require("./utils/messages");

const app = express();

const server = http.createServer(app); //http server that wraps the express app
const io = socketio(server); //initializing socket io

const port = process.env.PORT || 3000;

//serving the static files
const publicPath = path.join(__dirname, "./public");
app.use(express.static(publicPath));

let count = 0;

// sets up an event listener for new client connections(every refresh creates a new connection)
// io.on('connection', (socket) => { //socket is an object
//    console.log('new socket connection');
//    socket.emit('countUpdated', count) //send inital count to the clients
//    socket.on('increment', () => { //event listener for increment event
//        count++;
//        io.emit('countUpdated', count) //send updated count to all clients || if u put socket.emit only send to single client
//    })
// })

// challenge
io.on("connection", (socket) => {
  console.log("new socket connection");

  // socket.emit("message", "Welcome to the chat app");


  
  //listener for join
  socket.on("join", ({ username, room }) => {
    socket.join(room);

      //setting up timestamp for messages so commented above code
  socket.emit("message", generateMessage("Welcome to the chat app"))
  socket.broadcast.to(room).emit("message", generateMessage(`${username} has joined`)); // send to all clients except the one who joined
  })

  

  socket.on("sendMessage", (message, callback) => {
    io.emit("message", generateMessage(message)); //send to all clients
    callback('Delivered!'); //this is third argument in scoket.emit in chatjs
  });

  

  // listener for sending the location
  socket.on("sendLocation", (coords, callback) => {
    io.emit(
      "locationMessage",
      generateLocationMessage(`https://google.com/maps?/q=${coords.latitude},${coords.longitude}`)
    ); //${coords.latitude}, ${coords.longitude} `
    callback();
  });

  //notifying when a user leaves
  socket.on("disconnect", () => {
    io.emit("message", generateMessage("A user has left")); //send to all clients still connected
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

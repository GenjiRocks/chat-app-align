const path = require("path");
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const { log } = require("console");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");

const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

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
  socket.on("join", (Options, callback) => {
   
    const { error, user } = addUser({ id: socket.id, ...Options });
    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    //setting up timestamp for messages so commented above code
    socket.emit("message", generateMessage(`Admin, Welcome to the chat app`));
    socket.broadcast.to(user.room).emit("message", generateMessage(`Admin , ${user.username} has joined`)); // send to all clients except the one who joined
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room)
    })

    callback();

  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit("message", generateMessage(user.username,message)); //send to all clients
    callback("Delivered!"); //this is third argument in scoket.emit in chatjs
  });

  // listener for sending the location
  socket.on("sendLocation", (coords, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(user.username,
        `https://google.com/maps?/q=${coords.latitude},${coords.longitude}`
      )
    ); //${coords.latitude}, ${coords.longitude} `
    callback();
  });

  //notifying when a user leaves
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if(user){
      io.to(user.room).emit("message", generateMessage(`Admin ,${user.username} has left`)); //send to all clients still connected
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room)
      })
    }
    
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

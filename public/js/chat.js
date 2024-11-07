

    //io() //creates a socket connection from client side. This call initiates the connection with the server side.

const socket = io();
socket.on("countUpdated",(count)=>{
    console.log("the count has been updated",count);
}) //listening to the event countUpdated from the server side and updating the count on the client side.

//the name in emit and on should be same

document.querySelector("#increment").addEventListener("click",()=>{
    console.log("clicked");
    socket.emit("increment"); //from client side to server side
    
})
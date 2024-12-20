//io() //creates a socket connection from client side. This call initiates the connection with the server side.

const socket = io();

// socket.on("countUpdated",(count)=>{
//     console.log("the count has been updated",count);
// }) //listening to the event countUpdated from the server side and updating the count on the client side.

// //the name in emit and on should be same

// document.querySelector("#increment").addEventListener("click",()=>{
//     console.log("clicked");
//     socket.emit("increment"); //from client side to server side

// })

//elements for form and button states
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

//templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate = document.querySelector("#location-message-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//08/11 user login connection using query qs package
//Options
const {username,room} = Qs.parse(location.search, {
  ignoreQueryPrefix: true, //will remove the ? from url
})

//function to autoscroll
const autoScroll = () => {
  //new message element
  const $newMessage = $messages.lastElementChild;

  //height of new message
  const newMessageStyles = getComputedStyle($newMessage); //get all the styles components
  const newMessageMargin = parseInt(newMessageStyles.marginBottom); //margin bottom of the new message || string to int
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  //visible height
  const visibleHeight = $messages.offsetHeight;

  //height of messages container
  const containerHeight = $messages.scrollHeight;

  //how far have i scrolled
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if(containerHeight - newMessageHeight <= scrollOffset){
    $messages.scrollTop = $messages.scrollHeight;
  }
}


//challenge to message
/* socket.on("message", (message) => {
  console.log("message received :", message);
}); */
socket.on("message",(message)=>{
  console.log(message);
  const html = Mustache.render(messageTemplate,{
    username : message.username,
    message : message.text,
    createdAt : moment(message.createdAt).format('h:mm a') //since the time is unreadable - momentjs is used
    
  })
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
  
})

//listener for location
socket.on("locationMessage",(message)=>{
  console.log(message);
  const html = Mustache.render(locationMessageTemplate,{
    username:message.username,
    url : message.url,
    createdAt : moment(message.createdAt).format('h:mm a') 
  })
  $messages.insertAdjacentHTML("beforeend", html); 
  autoScroll();
})

//listener for room data
socket.on("roomData",({room,users})=>{
  const html = Mustache.render(sidebarTemplate,{
    room,
    users
  })
  document.querySelector("#sidebar").innerHTML = html;
})


$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  $messageFormButton.setAttribute("disabled", "disabled"); //disabling the button when the form is submitted
  
  const message = e.target.elements.message.value; //gets the value of the input field with name = "message" || this is used instead of queryselector
  
  socket.emit("sendMessage", message,(error)=>{ 
    
    //enable submit button
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();

    if(error){
      return console.log(error);
    }
    
    console.log('Message Delivered!');
    
  }); //message is send to the callback in "socket.on('sendMessage')"
});

$sendLocationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }

  $sendLocationButton.setAttribute("disabled", "disabled"); //disabling the button when the form is submitted

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit("sendLocation", {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    },()=>{
      $sendLocationButton.removeAttribute("disabled");
      console.log("Location shared!");
    });
  });
});


// for the username and room
socket.emit('join',{username,room},(error)=>{
  if(error){
    alert(error);
    location.href = '/';
  }
});
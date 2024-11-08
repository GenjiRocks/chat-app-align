//For storing the users data

const users = []

//addUser, removeUser, getUser, getUsersInRoom

exports.addUser = ({ id, username, room }) => {
    //clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }

    //check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    //validate username
    if (existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    //store user
    const user = { id, username, room }
    users.push(user)
    return { user }

}

exports.removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id) //-1 of no match || 0> if match found

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

// addUser({
//     id: 22,
//     username: 'Andrew  ',
//     room: '  South Philly'
// })

exports.getUser = (id) => {
    return users.find((user) => user.id === id)
}

exports.getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}



// const res = addUser({
//     id: 22,
//     username: 'Andrew  ',
//     room: '  South Philly'
// })

// const removedUser = removeUser(22)
//  console.log(removedUser) //checking remove users
//  console.log(users) // checking add users
// console.log(res); //checking username in use already


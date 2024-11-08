exports.generateMessage = (text)=>{
    return {
        text,
        createdAt: new Date().getTime()
    }
}

exports.generateLocationMessage = (url)=>{
    return {
        url,
        createdAt: new Date().getTime()
    }
}
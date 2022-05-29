

export  const generateMessage=(username:string,text:string)=>{
    return {
        username,
        text,
        createdAt:new Date().getTime()
    }
}

export const generateLocationMessage=(username:string,url:string)=>{
    return {
        username,
        url,
        createdAt:new Date().getTime()
    }
}
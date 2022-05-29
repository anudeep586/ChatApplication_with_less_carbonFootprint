const _user:any[]=[]
export const addUser=(user:any)=>{
    const username=user.username.trim().toLowerCase();
    const room=user.room.trim().toLowerCase()
    if(!username || !room){
        return {
            error:"Username and room name is required"
            
        }
    }
    const existingUser=_user.find((user:any)=>{
        return user.username===username && user.room===room;
    })
    if(existingUser){
        return {
            error:"Username already in use"
        }
    }
    const id=user.id
    _user.push({id,username,room})
    console.log(_user)
    return user
}

export const removeUser=(id:number)=>{
    const index=_user.findIndex((user:any)=>user.id===id)
    if(index!==-1){
        return _user.splice(index,1)[0]
    }
}


export const getUser=(id:number)=>{
    const user=_user.find((user:any)=>user.id===id)
    return user
}

export const getUsersByRoom=(room:string)=>{
    const users=_user.filter((user:any)=>user.room===room)
    return users
}

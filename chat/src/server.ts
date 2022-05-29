import logger = require('koa-logger');
import bodyparser = require('koa-bodyparser')
import { generateLocationMessage, generateMessage } from './utils/messages';
import { addUser, getUser, getUsersByRoom, removeUser } from './utils/users';
import Router = require('koa-router');
import { v4 as uuidv4 } from 'uuid';
import knex from '../src/database/db';
const http = require('http');
const Koa = require('koa');
const socketio = require('socket.io')
const filter = require('bad-words')
const app = new Koa();


const port = process.env.PORT || 8687

var serve = require('koa-static');
app.use(serve('./public'))
app.use(logger());
app.use(bodyparser());

const server = http.createServer(app.callback())
const io = socketio(server)
interface callbackType { (message: string): {} }

io.on('connection', (socket: any) => {


  socket.on('join', async(user: any, callback: callbackType) => {
    const username = user.username;
    const room = user.room;
    const password=user.password;
    const id=uuidv4()
    const data=await knex("chats").insert({
      id:id,
      room:room,
      username:username,
      password:password
        }).returning("*")
      console.log(data)
      // create a insert method for groups with dummmy data
    const { error, usr } = addUser({ id: socket.id, username, room })
    if (error) {
      return callback(error)
    }
    socket.join(user.room)
    socket.emit('message', generateMessage("Admin","Welcome!"))

    socket.broadcast.to(user.room).emit('message', generateMessage("Admin",`${username} user joined`))
    io.to(room).emit('roomData',{
      room:room,
      users:getUsersByRoom(user.room)
    })
  })
  socket.on('sendMessage', async(message: string, callback: callbackType) => {
    const getUsr = getUser(socket.id)
    const filt = new filter()
    if (filt.isProfane(message)) {
      return callback("profanity is not allowed")
    }
    console.log(getUsr.room)
    const data=await knex('chats').where({
      room:getUsr.room
    }).select("*");
    console.log(data,"sending message")
    const data1=knex("groups").insert({
      id:data[0].id,
      roomdata:getUsr.room,
      room:getUsr.room
    })
    io.to(getUsr.room).emit('message', generateMessage(getUsr.username,message))
    callback('delivered')
  })

  socket.on('disconnect', () => {
    const removeUsr = removeUser(socket.id)
    if (removeUsr) {
      io.to(removeUsr.room).emit('message', generateMessage('Admin',`${removeUsr.username} has been disconnected`))
      io.to(removeUsr.room).emit('roomData',{
        room:removeUsr.room,
        users:getUsersByRoom(removeUsr.room)
      })
    }
  })
  socket.on('sendLocation', (cords: any, callback: callbackType) => {
    const getUsr = getUser(socket.id)
    io.to(getUsr.room).emit('locationMessage', generateLocationMessage(getUsr.username,`https://google.com/maps?q=${cords.latitude},${cords.longitude}`))
    callback('succesfully shared location')
  })

})

server.listen(port, () => {
  console.log(` My koa server is up and listening on port ${port}`)
})

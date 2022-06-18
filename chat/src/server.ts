import logger = require("koa-logger");
import bodyparser = require("koa-bodyparser");
import { generateLocationMessage, generateMessage } from "./utils/messages";
import { stringify, v4 as uuidv4 } from "uuid";
import knex from "../src/database/db";
import * as Router from "koa-router";
import cors = require("@koa/cors");
import jwt = require("jsonwebtoken");
import filter = require("bad-words");
import http = require("http");
import Koa = require("koa");
import { insertData, location, locationSearch, messages, sendLocation, user } from "./data";



const socketio = require("socket.io");
const app = new Koa();
const router = new Router();
const port = process.env.PORT || 8687;
var serve = require("koa-static");

app.use(serve("./public"));
app.use(logger());
app.use(bodyparser());

router.post("/user", user);
router.post("/location", location);
app.use(router.routes());
app.use(cors());

const server = http.createServer(app.callback());
const io = socketio(server);
interface callbackType {
  (message: string): {};
}

io.on("connection", (socket: any) => {
  socket.on("join", async (token: any, callback: callbackType) => {
    const verifyToken: any = jwt.verify(token.token, "secret");
    const username = verifyToken.username;
    const room = verifyToken.room;
    const password = verifyToken.password;
    await insertData(username,room,password)
    const check = await messages(room)
    socket.join(room);
    socket.emit("message", generateMessage("Admin", "Welcome!"));
    check.forEach((data: any) => {
      const subString = "https://google.com/maps?";
      if (data.roomdata.includes(subString)) {
        io.to(socket.id).emit("locationMessage", generateLocationMessage(data.name, data.roomData));
      } else {
        io.to(socket.id).emit("message", generateMessage(`${data.name}`, `${data.roomdata}`));
      }
      callback("done");
    });
    const urs = await knex("users").where({ room: room }).select("username");
    io.to(room).emit("roomData", { room: room, users: urs, });
  });
  socket.on("sendMessage", async (message: any, callback: callbackType) => {
    const token: any = jwt.verify(message.token, "secret");
    await knex("messages").insert({ id: uuidv4(), roomdata: message.message, room: token.room, name: token.username });
    const filt = new filter();
    if (filt.isProfane(message.message)) {
      return callback("profanity is not allowed");
    }
    let obj: any={};
    let check: any;
    if (message.message.includes("@")) {
      const search=await locationSearch(message)
      obj.latitude=search.obj?.latitude;
      obj.longitude=search.obj?.longitude
      check=search.count
    }
    io.to(token.room).emit("message", generateMessage(token.username, message.message));
    if(message.message.includes("@mailCf")){
      io.to(token.room).emit("message",generateMessage("Admin"," Let's reduce Carbon Footprint. Below are some links to reduce carbon footprint "))
      io.to(token.room).emit("locationMessage", generateLocationMessage(`Admin`, `https://eco-age.com/resources/how-reduce-carbon-footprint-your-emails`));
      io.to(token.room).emit("disappear", generateMessage("Admin","disappear"));
    }
    if(message.message.includes("@websiteCf")){
      io.to(token.room).emit("message",generateMessage("Admin"," Let's reduce Carbon Footprint. Below are some links to reduce carbon footprint "))
      io.to(token.room).emit("locationMessage", generateLocationMessage(`Admin`, `https://vwo.com/blog/reduce-website-carbon-footprint/`));
      io.to(token.room).emit("locationMessage", generateLocationMessage(`Admin`, `https://builtin.com/software-engineering-perspectives/reducing-website-carbon-footprint`));
      io.to(token.room).emit("locationMessage", generateLocationMessage(`Admin`, `https://www.culturehive.co.uk/resources/sustainable-web-design-how-to-reduce-your-websites-carbon-footprint/`));
      io.to(token.room).emit("disappear", generateMessage("Admin","disappear"));
    }
    callback("delivered");
    if (check === true) {
      await knex("messages").insert({ id: uuidv4(), roomdata: `https://google.com/maps?q=${obj.latitude},${obj.longitude}`, room: token.room, name: 'Admin' });
      io.to(token.room).emit("locationMessage", generateLocationMessage(`Admin`, `https://google.com/maps?q=${obj.latitude},${obj.longitude}`));
    }
  });

  socket.on("disconnect", async () => {
    // const removeUsr = await knex("messages").where({sId:socket.id}).del().returning("*")
    // console.log(removeUsr,"removeUsr");
    // if (removeUsr) {
    //   io.to(removeUsr[0].room).emit('message', generateMessage('Admin', `${removeUsr[0].username} has been disconnected`))
    //   io.to(removeUsr[0].room).emit('roomData', {
    //     room: removeUsr[0].room,
    //     users: getUsersByRoom(removeUsr[0].room)
    //   })
    // }
    // io.to(room).emit('message', generateMessage('Admin', `${removeUsr[0].username} has been disconnected`))
  });
  socket.on("sendLocation", async (cords: any, callback: callbackType) => {
    const token:any=await sendLocation(cords)
    io.to(token.room).emit("locationMessage", generateLocationMessage(token.username, `https://google.com/maps?q=${cords.latitude},${cords.longitude}`));
    callback("succesfully shared location");
  });
});

server.listen(port, () => {
  console.log(` My koa server is up and listening on port ${port}`);
});


import jwt = require("jsonwebtoken");
import knex from "../src/database/db";
import { v4 as uuidv4 } from "uuid";



export const user=async(ctx:any)=>{
    console.log(ctx.request.body, "its getting here");
    ctx.body = jwt.sign(ctx.request.body, "secret");
}

export const messages=async(room:string)=>{
    const check = await knex("messages").where({ room: room }).select("*");
    return check

}
export const insertData=async(username:string,room:string,password:any)=>{
    await knex("users").insert({ id: uuidv4(), username: username, room: room, password: password, }).returning("*")
      .then(console.log)
      .catch((err: any) => {
        console.log(err);
      });
}

export const location=async(ctx:any)=>{
    const token: any = jwt.verify(ctx.request.body.token, "secret");
    await knex("location").insert({ id: uuidv4(), username: token.username, latitude: ctx.request.body.latitude, longitude: ctx.request.body.longitude, }).returning("*")
      .then(console.log)
      .catch(async (err: any) => {
        await knex("location").where({ username: token.username, }).update({ username: token.username, latitude: ctx.request.body.latitude, longitude: ctx.request.body.longitude, }).returning("*");
      });
    ctx.body = "location is in control";
}

export const locationSearch=async(message:any,)=>{
    let Obj:any={}
    Obj.count=true
    let data: any;
    let word:string;
    if(message.message.includes("@")){
        const hi=message.message.split(" ")
        for(let i=0;i<hi.length;i++){
            if(hi[i].includes('@')){
                word=hi[i].slice(1,hi[i].length-2)
            }
        }
    }
    data=await knex("location").where("username", "like", `%${word}%`).select("*");
      const distance = (lat1: number, lon1: number, lat2: number, lon2: number, unit: string) => {
        var radlat1 = (Math.PI * lat1) / 180;
        var radlat2 = (Math.PI * lat2) / 180;
        var theta = lon1 - lon2;
        var radtheta = (Math.PI * theta) / 180;
        var dist =
          Math.sin(radlat1) * Math.sin(radlat2) +
          Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
          dist = 1;
        }
        dist = Math.acos(dist);
        dist = (dist * 180) / Math.PI;
        dist = dist * 60 * 1.1515;
        if (unit == "K") {
          dist = dist * 1.609344;
        }
        if (unit == "N") {
          dist = dist * 0.8684;
        }
        return dist;
      };
      let count = 100000000;
      let dist = 0;

      data.forEach((each: any) => {
        const data = distance(parseFloat(message.latitude), parseFloat(message.longitude), parseFloat(each.latitude), parseFloat(each.longitude), "K");
        if (data < count) {
          dist = data;
          Obj.obj = each;
        }
      });
    return Obj
}

export const sendLocation=async(cords:any)=>{
    const token: any = jwt.verify(cords.token, "secret");
    await knex("messages").insert({ id: uuidv4(), roomdata: `https://google.com/maps?q=${cords.latitude},${cords.longitude}`, room: token.room, name: token.username, });
    console.log(token,"token data")
    return token 
}

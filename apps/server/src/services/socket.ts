import { Server } from "socket.io";
import Redis from "ioredis"
import prismaClient from "./prisma";
import { produceMessage } from "./kafka";
import { log } from "node:console";

// publisher
const pub = new Redis({
    host: "caching-282becf5-mahveenfatima2224-02cd.d.aivencloud.com",
    port: 12380,
    username: "default",
    password: process.env.PUB_PASSWORD,
});

//subscriber
const sub = new Redis({
    host: "caching-282becf5-mahveenfatima2224-02cd.d.aivencloud.com",
    port: 12380,
    username: "default",
    password: "AVNS_zM-t0JUe5lYsgKGgs3a",
})

class SocketService {
    private _io: Server;
    constructor() {
        console.log("Init Socket server")
        this._io = new Server({
            cors: {
                allowedHeaders: ["*"],
                origin: "*"
            }
        })
        sub.subscribe("MESSAGES")
    }

    public initListeners() {
        const io = this.io;
        console.log("Init socket listener...")

        // client connection listener
        io.on("connect", (socket) => {
            console.log(`New Socket Connected`, socket.id)
            
            // whenever we get msg we publish it to the redis
            // message emit listener
            socket.on("event: message", async ({message}: {message: string}) => {
                console.log("New Message Rec.", message)
                // publish this message to redis
                await pub.publish("MESSAGES", JSON.stringify({message}))
            })
        })

        // then we listen the msg from redis and emit the msg to the client
        sub.on("message", async (channel, message) => { 
            if(channel === "MESSAGES") {
                console.log("new message from redis", message)
                io.emit("message", message)
                await produceMessage(message)
                console.log("Message produce to kafka broker");
                
            }
        })

        
    }

    get io() {
        return this._io;
    }
}

export default SocketService;
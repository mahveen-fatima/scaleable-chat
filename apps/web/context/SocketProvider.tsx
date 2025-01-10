"use client"

import React, { useCallback, useContext, useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"

interface SocketProviderProps {
    children?: React.ReactNode
}

interface ISocketContext {
    sendMessage: (msg: string) => any
    messages: string[]
}

const SocketContext = React.createContext<ISocketContext | null>(null)


// custom hook
export const useSocket = () => {
    const state = useContext(SocketContext)
    if(!state) throw new Error(`State is undefined`)

        return state;
}


export const SocketProvider: React.FC<SocketProviderProps> = ({children}) => {

    const [socket, setSocket] = useState<Socket>()
    const [ messages, setMessages ] = useState<string[]>([])

    const sendMessage: ISocketContext["sendMessage"] = useCallback((msg) => {
        console.log("Send Message", msg)
        if(socket) {
            socket.emit("event: message", { message: msg })
        }
    }, [socket])

    const onMessageRec = useCallback((msg: string) => {
        console.log("From server msg Rec", msg)
        const {message} = JSON.parse(msg) as { message: string }
        setMessages((prev) => [...prev, message])
    }, [])

    // when socket provider mount it try to connect with server
    useEffect(() => {
        // backend address
        // it works for connection
        const _socket = io("http://localhost:8000");
        _socket.on("message", onMessageRec)
        setSocket(_socket)

        return() => {
            _socket.disconnect()
            _socket.off("message", onMessageRec)
            setSocket(undefined)
        }
    }, [])


    return (
        <SocketContext.Provider value={{sendMessage, messages}}>
            {children}
        </SocketContext.Provider>
    )
}
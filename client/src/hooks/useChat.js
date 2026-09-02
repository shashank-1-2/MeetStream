import { useCallback, useEffect, useRef, useState } from "react"
import { socket } from "../config/socket";

export const useChat = (roomId, user) => {
    const [messages, setMessages] = useState([])
    const [unreadCount, setUnreadCount] = useState(0);
    const [isChatOpen, setIsChatOpen] = useState(false)

    const isChatOpenRef = useRef(isChatOpen);
    
    useEffect(()=>{
        isChatOpenRef.current = isChatOpen;
    }, [isChatOpen])

    useEffect(()=>{
        if (!roomId) return;

        const handleReceiveMessage = (message)=>{
            // Prevent duplicate messages by ignoring ones we sent ourselves
            if (message.senderId === user?.id) return;

            setMessages((prev)=> [...prev, message]);
            if(!isChatOpenRef.current){
                setUnreadCount((prev) => prev + 1);
            }
        }

        socket.on("receive-message", handleReceiveMessage)

        return ()=>{
            socket.off("receive-message", handleReceiveMessage)
        }
    }, [roomId, user?.id]) // Added user?.id to dependency array


    const sendMessage = useCallback(
        (text) => {
            if(!text.trim() || !user) return;

            const message = {
                id: Date.now().toString(),
                text: text.trim(),
                senderName: user.name || user.fullName || "You",
                senderId: user.id,
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            }

            // 1. Optimistically update local UI immediately
            setMessages((prev) => [...prev, message]);

            // 2. Emit to backend
            socket.emit("send-message", { roomId, message })
        },
        [roomId, user] // Simplified dependency array
    );

    const toggleChat = useCallback(() => {
        setIsChatOpen((prev) => {
            if(!prev) setUnreadCount(0);
            return !prev;
        })
    }, [])

    return {
        messages,
        sendMessage,
        unreadCount,
        isChatOpen,
        toggleChat
    }
}
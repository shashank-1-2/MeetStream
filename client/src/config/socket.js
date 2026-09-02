import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_BASE_URL || "https://your-backend-name.onrender.com";

export const socket = io(SOCKET_URL, {
    autoConnect: false,
    withCredentials: true
})

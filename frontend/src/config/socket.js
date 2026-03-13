import { io } from 'socket.io-client';

let socketInstance = null; // shows connection between client and server

export const initializeSocket = () => {
    
    socketInstance = io(import.meta.env.VITE_API_URL, {
        auth : {
            token : localStorage.getItem('token')
        }
    });

    // socketInstance.on("connect", () => {
    //     console.log("✅ Socket connected:", socketInstance.id);
    // });

    // socketInstance.on("connect_error", (err) => {
    //     console.log("❌ Socket error:", err.message);
    // });

    return socketInstance;
}

export const recieveMessage = (eventName, cb) => {
    socketInstance.on(eventName, cb);
}

export const sendMessage = (eventName, data) => {
    socketInstance.emit(eventName, data);
}
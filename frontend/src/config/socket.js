import { io } from 'socket.io-client';

let socketInstance = null; 

export const initializeSocket = () => {
    
    if (socketInstance) return socketInstance;

    socketInstance = io(import.meta.env.VITE_API_URL, {
        auth : {
            token : sessionStorage.getItem('token')
        }, 
        transports: ['websocket']
    });

    socketInstance.on("connect", () => {
        console.log("✅ Socket connected:", socketInstance.id);
    });

    socketInstance.on("connect_error", (err) => {
        console.log("❌ Socket error:", err.message);
    });

    return socketInstance;
}

export const joinProject = (projectId) => {
    if (!socketInstance) {
        initializeSocket();
    }
    socketInstance.emit('join-project', { projectId });
}

export const recieveMessage = (eventName, cb) => {
    if (!socketInstance) {
        initializeSocket();
    }
    socketInstance.on(eventName, cb);
}

export const sendMessage = (eventName, data) => {
    if (!socketInstance) {
        initializeSocket();
    }
    socketInstance.emit(eventName, data);
}
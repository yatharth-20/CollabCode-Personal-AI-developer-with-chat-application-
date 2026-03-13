import dotenv from 'dotenv';
import http from 'http';
import app from './app.js';
import { Server } from 'socket.io';
// @ts-ignore: no declaration file for 'jsonwebtoken' in this project
import jwt from 'jsonwebtoken';


dotenv.config();    // to use environmental variables

console.log("✅ ENV LOADED:", process.env.MONGODB_URI);

const port = process.env.PORT || 3000;


const server = http.createServer(app);
const io = new Server(server, {
    cors : {
        origin : '*',
    }
});


io.use((socket, next) => {
    try {

        const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[ 1 ];
        if (!token) {
            return next(new Error('Authentication error'));
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET);

        if (!decode) {
            return next(new Error('Authentication error'));
        }

        socket.user = decode;
        next();
        
    } catch (error) {
        next(error); // next error ke sath call hota hai to socket connect nahi hota
    }
})


io.on('connection', socket => {

    console.log('A user connected');

    socket.on('event', data => { console.log('Socket event data:', data); });
    socket.on('disconnect', () => { /* … */ });
});


server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
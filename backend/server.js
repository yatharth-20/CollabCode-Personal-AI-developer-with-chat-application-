import dotenv from 'dotenv';
import http from 'http';
import app from './app.js';
import { Server } from 'socket.io';
// @ts-ignore: no declaration file for 'jsonwebtoken' in this project
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import projectModel from './models/project.model.js';


dotenv.config();    // to use environmental variables

console.log("✅ ENV LOADED:", process.env.MONGODB_URI);

const port = process.env.PORT || 3000;


const server = http.createServer(app);
const io = new Server(server, {
    cors : {
        origin : '*',
    }
});


io.use(async (socket, next) => {
    try {

        const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[ 1 ];

        const projectId = socket.handshake.query?.projectId;

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return next(new Error('Invalid projectId'));
        }


        socket.project = await projectModel.findById(projectId);
        
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

    socket.join(socket.project._id.toString());

    socket.on('project-message', data => {
        console.log('Received project message:', data);
        socket.broadcast.to(socket.project._id.toString()).emit('project-message', data);
    });

    socket.on('event', data => { console.log('Socket event data:', data); });
    socket.on('disconnect', () => { /* … */ });
});


server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
import dotenv from "dotenv";
import http from 'http';
import app from './app.js';
import { Server } from 'socket.io';
// @ts-ignore: no declaration file for 'jsonwebtoken' in this project
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import projectModel from './models/project.model.js';
import { generateResult } from "./services/ai.service.js";


dotenv.config();    // to use environmental variables

console.log("✅ ENV LOADED:", process.env.MONGODB_URI);

const port = process.env.PORT || 8080;


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true  // ← match Express setting
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

    socket.roomId = socket.project._id.toString();

    console.log('A user connected');

    socket.join(socket.roomId);

    socket.on('project-message', async data => {

        const message = data.message;

        const aiIsPresentInMessage = message.includes('@ai');
        socket.broadcast.to(socket.roomId).emit('project-message', data);

        if(aiIsPresentInMessage) {

            const prompt = message.replace('@ai', '').trim();

            const result = await generateResult(prompt);

            io.to(socket.roomId).emit('project-message', {
                message : result,
                sender : {
                    _id : 'ai',
                    email : 'AI'
                }
            })

            return;
        }

        // console.log('Received project message:', data);

        // io.to(socket.roomId).emit('project-message', data);  // message send to all including sender
        // socket.broadcast.to(socket.roomId).emit('project-message', data); // message send to all except sender

    });

    socket.on('disconnect', () => { 
        console.log('User disconnected');
        socket.leave(socket.roomId);
     });
});


server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

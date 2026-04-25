import dotenv from "dotenv";
import http from 'http';
import app from './app.js';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import projectModel from './models/project.model.js';
import { generateResult, generateResultStream } from "./services/ai.service.js";


dotenv.config({ override: true });

console.log("✅ ENV LOADED:", process.env.MONGODB_URI);

const port = process.env.PORT || 8080;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL || 'http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket']
});


io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token
            || socket.handshake.headers.authorization?.split(' ')[1];

        const projectId = socket.handshake.query?.projectId;

        if (projectId && !mongoose.Types.ObjectId.isValid(projectId)) {
            return next(new Error('Invalid projectId'));
        }

        if (projectId) {
            socket.project = await projectModel.findById(projectId);
        }

        if (!token) return next(new Error('Authentication error'));

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) return next(new Error('Authentication error'));

        socket.user = decoded;
        next();
    } catch (err) {
        next(err);
    }
});


io.on('connection', socket => {

    socket.join(`user_${socket.user._id}`);
    console.log(`User connected: ${socket.user.email} (ID: user_${socket.user._id})`);

    if (socket.project) {
        socket.roomId = socket.project._id.toString();
        socket.join(socket.roomId);
        console.log(`User joined project room: ${socket.roomId}`);
    }

    socket.on('join-project', async ({ projectId }) => {
        if (!mongoose.Types.ObjectId.isValid(projectId)) return;
        
        const project = await projectModel.findById(projectId);
        if (!project) return;

        const isCollaborator = project.users.some(u => u.toString() === socket.user._id.toString());
        if (!isCollaborator) return;

        socket.project = project;
        socket.roomId = projectId.toString();
        socket.join(socket.roomId);
        console.log(`User ${socket.user.email} joined project room: ${socket.roomId}`);
    });

    socket.on('project-message', async data => {
        const message = data.message;
        const isAiRequest = message.includes('@ai');

        if (!isAiRequest) {
            try {
                await projectModel.findByIdAndUpdate(socket.project._id, {
                    $push: {
                        messages: {
                            sender: socket.user._id,
                            message: message
                        }
                    }
                });
            } catch (err) { console.error('DB save error:', err); }

            socket.broadcast.to(socket.roomId).emit('project-message', data);

            if (socket.project && socket.project.users) {
                socket.project.users.forEach(userId => {
                    if (userId.toString() !== socket.user._id.toString()) {
                        io.to(`user_${userId}`).emit('project-notification', {
                            projectName: socket.project.name,
                            message: message,
                            sender: socket.user.email,
                            projectId: socket.project._id
                        });
                    }
                });
            }
            return;
        }

        const prompt = message.replace('@ai', '').trim();
        const history = Array.isArray(data.history) ? data.history : [];

        try {
            await projectModel.findByIdAndUpdate(socket.project._id, {
                $push: { aiMessages: { role: 'user', text: prompt } }
            });
        } catch (err) { console.error('AI DB save error:', err); }

        const conversationBlock = history.length
            ? history.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n') + '\n\n'
            : '';
        const fullPrompt = `${conversationBlock}New request: ${prompt}`;

        try {
            const stream = await generateResultStream(fullPrompt);

            let fullResponse = "";
            let streamedText = "";
            let isStreamingText = false;

            for await (const chunk of stream) {
                try {
                    const chunkText = chunk.text();
                    fullResponse += chunkText;

                    if (!isStreamingText && fullResponse.includes('"text": "')) {
                        isStreamingText = true;
                    }

                    if (isStreamingText) {
                        const startIdx = fullResponse.indexOf('"text": "') + 9;
                        let endIdx = fullResponse.indexOf('",', startIdx);
                        if (endIdx === -1) endIdx = fullResponse.indexOf('"}', startIdx);
                        
                        const currentText = endIdx === -1 
                            ? fullResponse.substring(startIdx) 
                            : fullResponse.substring(startIdx, endIdx);
                        
                        if (currentText !== streamedText) {
                            streamedText = currentText;
                            socket.emit('ai-stream-chunk', { text: streamedText });
                        }
                    }
                } catch (e) {
                    console.error('Chunk processing error:', e);
                }
            }

            io.to(socket.roomId).emit('project-message', {
                message: fullResponse,
                sender: { _id: 'ai', email: 'AI' }
            });

            try {
                let aiText = fullResponse;
                try {
                    const parsed = JSON.parse(fullResponse);
                    aiText = parsed.text || fullResponse;
                } catch (_) {}
                projectModel.findByIdAndUpdate(socket.project._id, {
                    $push: { aiMessages: { role: 'ai', text: aiText } }
                }).catch(err => console.error('AI background save error:', err));
            } catch (err) { console.error('AI save error:', err); }

        } catch (err) {
            console.error('AI handler error:', err);
            io.to(socket.roomId).emit('project-message', {
                message: JSON.stringify({ text: `⚠️ AI Error: ${err.message}` }),
                sender: { _id: 'ai', email: 'AI' }
            });
        }
    });

    socket.on('file-tree-update', data => {
        socket.broadcast.to(socket.roomId).emit('file-tree-update', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
        socket.leave(socket.roomId);
    });
});


server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

const gracefulShutdown = () => {
    console.log('\nShutting down gracefully...');
    server.closeAllConnections?.();
    server.close(() => {
        console.log('Server fully stopped.');
        process.exit(0);
    });
    setTimeout(() => process.exit(1), 3000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

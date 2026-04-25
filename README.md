# CollabCode: Personal AI Developer with Chat Application

CollabCode is a full-stack application designed to provide a personal AI developer environment with integrated chat functionality. It features a modern tech stack with a React frontend and an Express/Node.js backend, utilizing Google's Generative AI for intelligent coding assistance.

## Features

- **Real-time Collaboration**: Integrated chat application for seamless communication.
- **AI-Powered Development**: Leverages Google's Generative AI to assist in code generation and project management.
- **Full-Stack Architecture**: Modern backend with Express, Mongoose, and Socket.io; reactive frontend with Vite and TailwindCSS.
- **Secure Authentication**: Robust user authentication system.

## Project Structure

- `backend/`: Express server, socket handlers, and database models.
- `frontend/`: React application with Vite, handling UI and real-time interactions.

## Setup Instructions

### Prerequisites

- Node.js installed
- MongoDB instance running
- Google Generative AI API Key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yatharth-20/CollabCode-Personal-AI-developer-with-chat-application-.git
   cd CollabCode-Personal-AI-developer-with-chat-application-
   ```

2. Install dependencies for both backend and frontend:
   ```bash
   # In root directory
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the `backend/` directory with necessary credentials (MONGO_URI, JWT_SECRET, GOOGLE_AI_KEY, etc.).

4. Run the application:
   You can use the provided batch script for Windows:
   ```bash
   ./run-collab-code.bat
   ```
   Or run them manually:
   - Backend: `cd backend && npm run dev`
   - Frontend: `cd frontend && npm run dev`

## License

This project is licensed under the MIT License.
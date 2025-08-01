# Remote Dev Team Hub

A real-time collaborative platform for distributed software engineering teams. Enables code sharing, task management, video standups, and project retrospectives. Think of it as a lightweight hybrid between GitHub Projects, Slack, and Miro.

## 🚀 Features

- **Real-time Kanban Board** - Drag-and-drop task management with live updates
- **Daily Video Check-ins** - Integrated video calls for team standups
- **Code Snippet Sharing** - Share code with version history and collaborative editing
- **Sprint Retrospectives** - Collaborative retrospective boards for continuous improvement
- **Real-time Notifications** - Instant updates for commits, PRs, and task changes
- **Team Collaboration** - Live presence indicators and typing notifications

## 👥 User Roles

- **Team Members** - Create and manage tasks, participate in standups
- **Team Leads** - Manage team members and project oversight
- **Project Managers** - Full project management and team administration

## 🛠 Tech Stack

### Frontend
- **React.js** - Modern UI framework
- **TailwindCSS** - Utility-first CSS framework
- **Socket.io Client** - Real-time communication
- **Firebase Auth** - Authentication and user management
- **React Router** - Client-side routing
- **@dnd-kit** - Drag and drop functionality
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.io** - Real-time bidirectional communication
- **PostgreSQL** - Relational database
- **Firebase Admin** - Server-side authentication
- **JWT** - Token-based authentication

## 🎨 Design System

### Color Scheme
- **Midnight Blue** (`#0f172a`) - Primary background
- **Neon Green** (`#22c55e`) - Accent and success states
- **Slate Gray** (`#64748b`) - Secondary elements
- **White** (`#ffffff`) - Text and highlights

### Typography
- **Primary Font** - Inter (Google Fonts)
- **Monospace Font** - JetBrains Mono (for code)

## 📁 Project Structure

```
Remote Dev Team Hub/
├── frontend/                 # React.js frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── auth/        # Authentication components
│   │   │   ├── layout/      # Layout components (Header, Sidebar, etc.)
│   │   │   └── ui/          # Basic UI components
│   │   ├── contexts/        # React contexts (Auth, Socket)
│   │   ├── config/          # Configuration files
│   │   ├── pages/           # Page components
│   │   └── App.jsx          # Main application component
│   ├── public/              # Static assets
│   └── package.json         # Frontend dependencies
├── backend/                 # Node.js backend application
│   ├── config/              # Database and Firebase configuration
│   ├── middleware/          # Express middleware
│   ├── routes/              # API route handlers
│   ├── socket/              # Socket.io event handlers
│   ├── server.js            # Main server file
│   └── package.json         # Backend dependencies
└── README.md               # Project documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- Firebase project for authentication

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   - Database connection details
   - Firebase service account credentials
   - JWT secret key

4. **Database Setup**
   - Create a PostgreSQL database
   - The application will automatically create tables on first run

5. **Start the server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your Firebase configuration

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication with Google provider
3. Generate service account credentials for backend
4. Get web app configuration for frontend

### Database Schema

The application uses PostgreSQL with the following main tables:
- `users` - User profiles and authentication
- `projects` - Project information
- `project_members` - Project membership and roles
- `tasks` - Task management with Kanban support
- `code_snippets` - Code sharing with version history
- `retrospectives` - Sprint retrospective data
- `notifications` - Real-time notification system

## 🌟 Key Features Implementation

### Real-time Communication
- Socket.io for bidirectional communication
- Live task updates across all connected clients
- Presence indicators for active users
- Typing indicators for collaborative editing

### Authentication & Authorization
- Firebase Authentication for secure login
- Role-based access control
- JWT tokens for API security
- Project-level permissions

### Task Management
- Drag-and-drop Kanban board
- Real-time task updates
- Priority and status management
- Due date tracking

## 🚧 Development Status

### ✅ Completed
- [x] Project structure and configuration
- [x] Backend API with authentication
- [x] Database schema and models
- [x] Socket.io real-time communication
- [x] Frontend React application structure
- [x] Authentication system
- [x] Basic UI components and layout
- [x] TailwindCSS styling system

### 🔄 In Progress
- [ ] Kanban board with drag-and-drop
- [ ] Video call integration
- [ ] Code snippet sharing
- [ ] Retrospective boards
- [ ] Advanced notifications

### 📋 Planned
- [ ] Mobile responsive design
- [ ] Advanced search and filtering
- [ ] File upload and sharing
- [ ] Integration with Git providers
- [ ] Advanced analytics and reporting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the API documentation at `/api/docs` when running locally

---

Built with ❤️ for distributed development teams

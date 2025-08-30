# Tiny Habit Logger

A minimal but complete full-stack habit tracking application that helps you track a single habit by day. Built with React (frontend) and Node.js/Express (backend).

## Features

- ✅ **Track a single habit** (e.g., "Drink Water") by day
- 📊 **7-day streak display** showing consecutive days
- 🎯 **Mark Done** for today to continue your streak
- 🔄 **Reset** functionality to clear all data
- 💾 **Dual persistence**: IndexedDB with localStorage fallback
- 🌐 **Optional backend sync** for data persistence across devices
- 📱 **Responsive design** with modern UI
- ⚡ **Real-time updates** and graceful error handling

## Tech Stack

### Frontend
- **React** 18+ with hooks
- **Tailwind CSS** for styling
- **Vite** for build tooling
- **IndexedDB** with localStorage fallback

### Backend
- **Node.js** with Express
- **JSON file storage** for persistence
- **CORS** enabled for cross-origin requests
- **RESTful API** design

## Project Structure

```
newcompanytask/
├── Frontend/                 # React application
│   ├── src/
│   │   ├── components/
│   │   │   └── HabitTracker.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
├── Backend/                  # Node.js API server
│   ├── server.js
│   ├── package.json
│   └── data.json            # Auto-generated data file
└── README.md
```

## Setup Instructions

### Prerequisites
- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js)

### Backend Setup

1. **Navigate to the Backend directory:**
   ```bash
   cd Backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the backend server:**
   ```bash
   npm start
   ```
   
   The backend server will start on **http://localhost:5000**

   **Alternative (with auto-restart for development):**
   ```bash
   npm run dev
   ```
   *Note: This requires nodemon to be installed globally: `npm install -g nodemon`*

### Frontend Setup

1. **Navigate to the Frontend directory:**
   ```bash
   cd Frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   
   The frontend will start on **http://localhost:3000**

## Running the Application

### Full Stack (Recommended)

1. **Start the backend server** (Terminal 1):
   ```bash
   cd Backend
   npm start
   ```
   ✅ Backend running on http://localhost:5000

2. **Start the frontend server** (Terminal 2):
   ```bash
   cd Frontend
   npm run dev
   ```
   ✅ Frontend running on http://localhost:3000

3. **Open your browser** and navigate to http://localhost:3000

### Frontend Only (Local Storage)

The application works perfectly with just the frontend if the backend is not available:

```bash
cd Frontend
npm run dev
```

Data will be stored locally using IndexedDB (with localStorage fallback).

## API Endpoints

The backend provides the following REST API endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/habit` | Get habit data and current streak |
| POST | `/api/habit/complete` | Mark habit as completed for today |
| POST | `/api/habit/reset` | Reset all habit data |
| GET | `/api/habit/history` | Get last 7 days history |

## Usage Guide

### First Time Use
1. Open the application in your browser
2. You'll see a streak of 0 and empty 7-day history
3. Click "Mark Done for Today" to start your streak

### Daily Usage
1. Open the app each day
2. Click "Mark Done for Today" if you completed your habit
3. Watch your streak grow!

### Features
- **Streak Calculation**: Shows consecutive days from today backwards
- **7-Day History**: Visual representation of the last 7 days
- **Data Persistence**: Automatically saves your progress
- **Reset Function**: Clear all data to start fresh
- **Offline Support**: Works without internet connection

## Data Storage

### Frontend Storage
- **Primary**: IndexedDB (modern browsers)
- **Fallback**: localStorage (older browsers)
- **Automatic**: Graceful fallback if IndexedDB fails

### Backend Storage
- **File**: `Backend/data.json` (auto-created)
- **Format**: JSON with habit records by date
- **Backup**: Manual backup recommended for production

## Development

### Frontend Development
```bash
cd Frontend
npm run dev    # Start dev server with hot reload
npm run build  # Build for production
npm run preview # Preview production build
```

### Backend Development
```bash
cd Backend
npm start      # Start server
npm run dev    # Start with nodemon (auto-restart)
```

### Environment Variables

Create `.env` files if needed:

**Backend/.env.example:**
```
PORT=3001
NODE_ENV=development
```

**Frontend/.env.example:**
```
VITE_API_BASE_URL=http://localhost:3001/api
```

## Troubleshooting

### Common Issues

1. **Port already in use:**
   - Backend: Change PORT in `Backend/.env` or kill process on port 3001
   - Frontend: Vite will automatically suggest alternative port

2. **CORS errors:**
   - Ensure backend is running on port 3001
   - Check that CORS is enabled in `server.js`

3. **Data not persisting:**
   - Check browser console for IndexedDB/localStorage errors
   - Ensure backend `data.json` file has write permissions

4. **Backend not connecting:**
   - App will work in "Local Only" mode
   - Check backend server is running and accessible

### Browser Support
- **Modern browsers**: Full IndexedDB support
- **Older browsers**: localStorage fallback
- **Mobile**: Responsive design works on all devices

## Production Deployment

### Frontend
```bash
cd Frontend
npm run build
# Deploy 'dist' folder to your hosting service
```

### Backend
```bash
cd Backend
# Deploy to your Node.js hosting service
# Ensure data.json has proper file permissions
```

## License

This project is created for educational purposes as part of a coding assessment.

## Assignment Compliance

✅ **Feature Requirements:**
- Track single habit ("Drink Water")
- Mark Done for today
- View last 7 days
- Reset functionality

✅ **Persistence Requirements:**
- IndexedDB preferred with localStorage fallback
- Backend persistence (Node.js/Express)

✅ **UI Requirements:**
- Title display
- 7-day streak display
- Two buttons: Mark Done, Reset

✅ **Acceptance Criteria:**
- Creates/updates record for today
- Data persists on page reload
- Streak shows consecutive days
- Graceful IndexedDB fallback
- Full stack implementation

✅ **Technical Requirements:**
- React frontend
- Node.js backend
- Clear run instructions
- Specified ports (Frontend: 5173, Backend: 3001)
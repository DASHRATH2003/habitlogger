const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Data file path
const DATA_FILE = path.join(__dirname, 'data.json');

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
        habit: {
            name: "Drink Water",
            records: {}
        }
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
}

// Helper functions
const readData = () => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading data file:', error);
        return { habit: { name: "Drink Water", records: {} } };
    }
};

const writeData = (data) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing data file:', error);
        return false;
    }
};

const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
};

const calculateStreak = (records) => {
    const today = new Date();
    let streak = 0;
    let currentDate = new Date(today);
    
    while (true) {
        const dateString = currentDate.toISOString().split('T')[0];
        if (records[dateString]) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else {
            break;
        }
    }
    
    return streak;
};

// API Routes

// Get habit data and streak
app.get('/api/habit', (req, res) => {
    try {
        const data = readData();
        const streak = calculateStreak(data.habit.records);
        const todayString = getTodayString();
        const completedToday = !!data.habit.records[todayString];
        
        res.json({
            name: data.habit.name,
            streak: streak,
            completedToday: completedToday,
            records: data.habit.records
        });
    } catch (error) {
        console.error('Error getting habit data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Mark habit as done for today
app.post('/api/habit/complete', (req, res) => {
    try {
        const data = readData();
        const todayString = getTodayString();
        
        data.habit.records[todayString] = {
            completed: true,
            timestamp: new Date().toISOString()
        };
        
        if (writeData(data)) {
            const streak = calculateStreak(data.habit.records);
            res.json({
                success: true,
                streak: streak,
                completedToday: true,
                message: 'Habit marked as completed for today'
            });
        } else {
            res.status(500).json({ error: 'Failed to save data' });
        }
    } catch (error) {
        console.error('Error completing habit:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Reset all habit data
app.post('/api/habit/reset', (req, res) => {
    try {
        const data = readData();
        data.habit.records = {};
        
        if (writeData(data)) {
            res.json({
                success: true,
                streak: 0,
                completedToday: false,
                message: 'Habit data reset successfully'
            });
        } else {
            res.status(500).json({ error: 'Failed to save data' });
        }
    } catch (error) {
        console.error('Error resetting habit:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get last 7 days of records
app.get('/api/habit/history', (req, res) => {
    try {
        const data = readData();
        const history = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            
            history.push({
                date: dateString,
                completed: !!data.habit.records[dateString],
                dayName: date.toLocaleDateString('en-US', { weekday: 'short' })
            });
        }
        
        res.json(history);
    } catch (error) {
        console.error('Error getting habit history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Tiny Habit Logger API is running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Tiny Habit Logger API server running on port ${PORT}`);
    console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
});

module.exports = app;
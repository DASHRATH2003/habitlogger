import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

const HabitTracker = () => {
  const [habitData, setHabitData] = useState({
    name: 'Drink Water',
    streak: 0,
    completedToday: false,
    history: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backendAvailable, setBackendAvailable] = useState(false);
  const [syncStatus, setSyncStatus] = useState('local'); // 'local', 'syncing', 'synced', 'error'

  // IndexedDB setup with localStorage fallback
  const DB_NAME = 'HabitTrackerDB';
  const DB_VERSION = 1;
  const STORE_NAME = 'habits';
  const STORAGE_KEY = 'habitTracker';

  // Initialize IndexedDB
  const initDB = () => {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        console.log('IndexedDB not supported, using localStorage');
        resolve(null);
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => {
        console.log('IndexedDB error, falling back to localStorage');
        resolve(null);
      };
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  };

  // Save data to IndexedDB or localStorage
  const saveDataLocally = async (data) => {
    try {
      const db = await initDB();
      
      if (db) {
        // Use IndexedDB
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        await store.put({ id: 'habitData', ...data });
      } else {
        // Fallback to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error saving data locally:', error);
      // Final fallback to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  };

  // Load data from IndexedDB or localStorage
  const loadDataLocally = async () => {
    try {
      const db = await initDB();
      
      if (db) {
        // Use IndexedDB
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get('habitData');
        
        return new Promise((resolve) => {
          request.onsuccess = () => {
            if (request.result) {
              const { id, ...data } = request.result;
              resolve(data);
            } else {
              resolve(null);
            }
          };
          request.onerror = () => resolve(null);
        });
      } else {
        // Fallback to localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
      }
    } catch (error) {
      console.error('Error loading data locally:', error);
      // Final fallback to localStorage
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    }
  };

  // Sync with backend (optional)
  const syncWithBackend = async (action, data = null) => {
    if (!backendAvailable) return null;
    
    try {
      setSyncStatus('syncing');
      let result;
      
      switch (action) {
        case 'load':
          result = await apiService.getHabit();
          break;
        case 'complete':
          result = await apiService.completeHabit();
          break;
        case 'reset':
          result = await apiService.resetHabit();
          break;
        default:
          return null;
      }
      
      setSyncStatus('synced');
      setTimeout(() => setSyncStatus('local'), 2000);
      return result;
    } catch (error) {
      console.error('Backend sync failed:', error);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('local'), 3000);
      return null;
    }
  };

  // Calculate streak from records
  const calculateStreak = (records) => {
    if (!records || Object.keys(records).length === 0) return 0;
    
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

  // Get last 7 days history
  const getLast7Days = (records) => {
    const history = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      history.push({
        date: dateString,
        completed: !!records[dateString],
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' })
      });
    }
    
    return history;
  };

  // Check backend availability
  useEffect(() => {
    const checkBackend = async () => {
      const available = await apiService.isBackendAvailable();
      setBackendAvailable(available);
      if (available) {
        console.log('Backend is available - enabling sync features');
      } else {
        console.log('Backend not available - using local storage only');
      }
    };
    
    checkBackend();
  }, []);

  // Load initial data
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        
        // Try to load from backend first if available
        let backendData = null;
        if (backendAvailable) {
          backendData = await syncWithBackend('load');
        }
        
        // Load from local storage
        const localData = await loadDataLocally();
        
        // Use backend data if available, otherwise use local data
        const savedData = backendData || localData;
        
        if (savedData && savedData.records) {
          const streak = calculateStreak(savedData.records);
          const todayString = new Date().toISOString().split('T')[0];
          const completedToday = !!savedData.records[todayString];
          const history = getLast7Days(savedData.records);
          
          setHabitData({
            name: savedData.name || 'Drink Water',
            streak,
            completedToday,
            history,
            records: savedData.records
          });
          
          // Save to local storage if we got data from backend
          if (backendData) {
            await saveDataLocally(savedData);
          }
        } else {
          // Initialize with empty data
          const initialData = {
            name: 'Drink Water',
            records: {}
          };
          await saveDataLocally(initialData);
          setHabitData({
            name: 'Drink Water',
            streak: 0,
            completedToday: false,
            history: getLast7Days({}),
            records: {}
          });
        }
      } catch (error) {
        console.error('Error initializing data:', error);
        setError('Failed to load habit data');
      } finally {
        setLoading(false);
      }
    };

    if (backendAvailable !== null) {
      initializeData();
    }
  }, [backendAvailable]);

  // Mark habit as done for today
  const markDone = async () => {
    try {
      const todayString = new Date().toISOString().split('T')[0];
      const updatedRecords = {
        ...habitData.records,
        [todayString]: {
          completed: true,
          timestamp: new Date().toISOString()
        }
      };
      
      const updatedData = {
        name: habitData.name,
        records: updatedRecords
      };
      
      // Save locally first (primary persistence)
      await saveDataLocally(updatedData);
      
      // Try to sync with backend
      await syncWithBackend('complete');
      
      const newStreak = calculateStreak(updatedRecords);
      const newHistory = getLast7Days(updatedRecords);
      
      setHabitData({
        ...habitData,
        streak: newStreak,
        completedToday: true,
        history: newHistory,
        records: updatedRecords
      });
    } catch (error) {
      console.error('Error marking habit as done:', error);
      setError('Failed to mark habit as done');
    }
  };

  // Reset all habit data
  const resetHabit = async () => {
    try {
      const resetData = {
        name: habitData.name,
        records: {}
      };
      
      // Save locally first (primary persistence)
      await saveDataLocally(resetData);
      
      // Try to sync with backend
      await syncWithBackend('reset');
      
      setHabitData({
        name: habitData.name,
        streak: 0,
        completedToday: false,
        history: getLast7Days({}),
        records: {}
      });
    } catch (error) {
      console.error('Error resetting habit:', error);
      setError('Failed to reset habit data');
    }
  };

  const getSyncStatusDisplay = () => {
    switch (syncStatus) {
      case 'syncing':
        return { text: 'Syncing...', color: 'text-blue-500', icon: '🔄' };
      case 'synced':
        return { text: 'Synced', color: 'text-green-500', icon: '✅' };
      case 'error':
        return { text: 'Sync Error', color: 'text-red-500', icon: '❌' };
      default:
        return { text: backendAvailable ? 'Local + Backend' : 'Local Only', color: 'text-gray-500', icon: '💾' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your habit tracker...</p>
        </div>
      </div>
    );
  }

  const syncDisplay = getSyncStatusDisplay();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Tiny Habit Logger</h1>
          <p className="text-gray-600">Track your daily habit consistently</p>
          
          {/* Sync Status */}
          <div className={`text-sm mt-2 ${syncDisplay.color}`}>
            <span className="mr-1">{syncDisplay.icon}</span>
            {syncDisplay.text}
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          {/* Habit Title */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">{habitData.name}</h2>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-4xl font-bold text-indigo-600">{habitData.streak}</span>
              <div className="text-left">
                <p className="text-sm text-gray-500">day{habitData.streak !== 1 ? 's' : ''}</p>
                <p className="text-sm text-gray-500">streak</p>
              </div>
            </div>
          </div>

          {/* 7-Day History */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-3 text-center">Last 7 Days</h3>
            <div className="flex justify-center space-x-2">
              {habitData.history.map((day, index) => (
                <div key={day.date} className="text-center">
                  <div className="text-xs text-gray-500 mb-1">{day.dayName}</div>
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      day.completed 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {day.completed ? '✓' : '○'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="text-center mb-6">
            {habitData.completedToday ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-800 font-medium">✅ Completed today!</p>
                <p className="text-green-600 text-sm">Great job staying consistent!</p>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800 font-medium">⏰ Not completed today</p>
                <p className="text-yellow-600 text-sm">Mark it done to continue your streak!</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={markDone}
              disabled={habitData.completedToday}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                habitData.completedToday
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {habitData.completedToday ? 'Already Completed Today' : 'Mark Done for Today'}
            </button>
            
            <button
              onClick={resetHabit}
              className="w-full py-3 px-4 rounded-lg font-medium bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
            >
              Reset All Data
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 text-sm">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="text-red-600 text-sm underline mt-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>Data is automatically saved locally</p>
          <p className="mt-1">Using {window.indexedDB ? 'IndexedDB' : 'localStorage'} for persistence</p>
          {backendAvailable && (
            <p className="mt-1 text-green-600">✓ Backend sync enabled</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HabitTracker;
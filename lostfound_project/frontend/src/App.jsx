import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ReportItem from './pages/ReportItem';
import MyListings from './pages/MyListings';
import Chat from './pages/Chat';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setInitializing(false);
  }, []);

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (initializing) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-secondary)' }}>
        <p>Initializing portal...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="app-container">
        {user && <Navbar user={user} onLogout={handleLogout} />}
        
        <main className={user ? 'main-content' : ''}>
          <Routes>
            {!user ? (
              <>
                <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </>
            ) : (
              <>
                <Route path="/" element={<Dashboard user={user} />} />
                <Route path="/report" element={<ReportItem user={user} />} />
                <Route path="/listings" element={<MyListings user={user} />} />
                <Route path="/chat" element={<Chat user={user} />} />
                
                {user.admin ? (
                  <Route path="/admin" element={<AdminDashboard user={user} />} />
                ) : (
                  <Route path="/admin" element={<Navigate to="/" replace />} />
                )}
                
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            )}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

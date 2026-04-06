import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/auth/LoginPage';

/**
 * Smart Campus Hub - Frontend Application
 * 
 * Main React application component
 * Entry point for the web UI
 * 
 * Features:
 * - OAuth 2.0 Google authentication
 * - Responsive Material-UI design
 * - Modular component architecture
 * - Real-time notifications
 * - Role-based dashboard views
 */
function App() {
  const [authToken, setAuthToken] = React.useState(localStorage.getItem('authToken'));

  if (!authToken) {
    return <LoginPage setAuthToken={setAuthToken} />;
  }

  return (
    <Router>
      <div className="app-container">
        <Header />
        <div className="app-body">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              {/* Additional routes will be added for each module */}
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;

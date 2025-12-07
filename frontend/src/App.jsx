import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './utils/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SharedWithMe from './pages/SharedWithMe';
import SharedFile from './pages/SharedFile';
import AuditLog from './pages/AuditLog';

import './index.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className ="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/shared/:token" element={<SharedFile />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/shared-with-me"
              element={
                <PrivateRoute>
                  <SharedWithMe />
                </PrivateRoute>
              }
            />
            <Route
              path="/audit-log"
              element={
                <PrivateRoute>
                  <AuditLog />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;

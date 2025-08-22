import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import LoginForm from '@/components/LoginForm';
import EmployeeDashboard from '@/pages/EmployeeDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import './index.css';

const App: React.FC = () => {
  const { isAuthenticated, userType } = useAuthStore();

  return (
    <Router>
      <div className="App">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        
        <Routes>
          <Route 
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to={userType === 'admin' ? '/admin' : '/employee'} replace />
              ) : (
                <LoginForm />
              )
            } 
          />
          
          <Route 
            path="/employee" 
            element={
              isAuthenticated && userType === 'employee' ? (
                <EmployeeDashboard />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          <Route 
            path="/admin" 
            element={
              isAuthenticated && userType === 'admin' ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          <Route 
            path="/" 
            element={
              isAuthenticated ? (
                <Navigate to={userType === 'admin' ? '/admin' : '/employee'} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

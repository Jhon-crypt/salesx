import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Simple authentication context simulation
const AuthContext = React.createContext<{
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}>({
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

// Protected route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // For demo purposes, we'll consider users authenticated if they've visited the login page
  // In a real app, you would check for tokens and validate authentication status
  const [hasVisitedLogin, setHasVisitedLogin] = useState(
    localStorage.getItem('hasVisitedLogin') === 'true'
  );
  const location = useLocation();

  // When a user visits login, set the flag
  React.useEffect(() => {
    if (location.pathname === '/login') {
      localStorage.setItem('hasVisitedLogin', 'true');
      setHasVisitedLogin(true);
    }
  }, [location]);

  if (!hasVisitedLogin) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('hasVisitedLogin');
  };

  const authContextValue = {
    isAuthenticated,
    login,
    logout,
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthContext.Provider value={authContextValue}>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/sales/*" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <div>Sales pages coming soon</div>
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/menu/*" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <div>Menu pages coming soon</div>
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tables" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <div>Tables management coming soon</div>
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/inventory" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <div>Inventory management coming soon</div>
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customers" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <div>Customer management coming soon</div>
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analytics/*" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <div>Analytics pages coming soon</div>
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <div>Settings page coming soon</div>
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthContext.Provider>
    </ThemeProvider>
  );
}

export default App;

// Export the context for use in other components
export const useAuth = () => React.useContext(AuthContext);

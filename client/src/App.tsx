import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Transactions from './pages/Transactions';
import VoidTransactions from './pages/VoidTransactions';
import SalesReport from './pages/SalesReport';
import MenuAnalysis from './pages/MenuAnalysis';
import MenuItemsByHour from './pages/MenuItemsByHour';
import Stores from './pages/Stores';
import { isAuthenticated, logoutUser, getUserData } from './utils/authUtils';
import { StoreProvider } from './contexts/StoreContext';

// Authentication context with improved security
interface AuthContextType {
  isAuthenticated: boolean;
  userData: typeof getUserData extends () => infer R ? R : null;
  login: () => void;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextType>({
  isAuthenticated: false,
  userData: null,
  login: () => {},
  logout: () => {},
});

// Protected route wrapper with secure authentication check
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const authenticated = isAuthenticated();

  if (!authenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

function App() {
  const [authState, setAuthState] = useState({
    isAuthenticated: isAuthenticated(),
    userData: getUserData()
  });

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = () => {
      setAuthState({
        isAuthenticated: isAuthenticated(),
        userData: getUserData()
      });
    };

    // Check immediately
    checkAuth();

    // Set up interval to regularly check token expiration
    const interval = setInterval(checkAuth, 60000); // Check every minute
    
    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, []);

  const login = () => {
    setAuthState({
      isAuthenticated: true,
      userData: getUserData()
    });
  };

  const logout = () => {
    logoutUser();
    setAuthState({
      isAuthenticated: false,
      userData: null
    });
  };

  const authContextValue = {
    isAuthenticated: authState.isAuthenticated,
    userData: authState.userData,
    login,
    logout,
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthContext.Provider value={authContextValue}>
        <StoreProvider>
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
                path="/sales/transactions" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Transactions />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/sales/void-transactions" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <VoidTransactions />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/sales/report" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <SalesReport />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/stores" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Stores />
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
                path="/menu/analysis" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <MenuAnalysis />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/menu/items-by-hour" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <MenuItemsByHour />
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
        </StoreProvider>
      </AuthContext.Provider>
    </ThemeProvider>
  );
}

export const useAuth = () => React.useContext(AuthContext);
export default App;

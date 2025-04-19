import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route 
            path="/dashboard" 
            element={
              <Layout>
                <Dashboard />
              </Layout>
            } 
          />
          <Route 
            path="/sales/*" 
            element={
              <Layout>
                <div>Sales pages coming soon</div>
              </Layout>
            } 
          />
          <Route 
            path="/menu/*" 
            element={
              <Layout>
                <div>Menu pages coming soon</div>
              </Layout>
            } 
          />
          <Route 
            path="/tables" 
            element={
              <Layout>
                <div>Tables management coming soon</div>
              </Layout>
            } 
          />
          <Route 
            path="/inventory" 
            element={
              <Layout>
                <div>Inventory management coming soon</div>
              </Layout>
            } 
          />
          <Route 
            path="/customers" 
            element={
              <Layout>
                <div>Customer management coming soon</div>
              </Layout>
            } 
          />
          <Route 
            path="/analytics/*" 
            element={
              <Layout>
                <div>Analytics pages coming soon</div>
              </Layout>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <Layout>
                <div>Settings page coming soon</div>
              </Layout>
            } 
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

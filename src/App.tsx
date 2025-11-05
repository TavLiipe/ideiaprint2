import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Public components
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import Portfolio from './components/Portfolio';
import About from './components/About';
import CallToAction from './components/CallToAction';
import Contact from './components/Contact';
import Footer from './components/Footer';

// Admin components
import Login from './components/admin/Login';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './components/admin/Dashboard';

// Public landing page
const LandingPage = () => (
  <div
    className="min-h-screen text-white"
    style={{
      background: 'linear-gradient(135deg, rgb(1, 16, 31) 0%, rgb(0, 8, 18) 100%)'
    }}
  >
    <Header />
    <Hero />
    <Services />
    <Portfolio />
    <About />
    <CallToAction />
    <Contact />
    <Footer />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Admin routes */}
          <Route path="/admin/login" element={<Login />} />
          <Route 
            path="/admin" 
            element={<Navigate to="/admin/dashboard" replace />}
          />
          <Route 
            path="/admin/dashboard" 
            element={
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            } 
          />
          
          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Header from './components/Header/Header';
import AuthModal from './components/AuthModal/AuthModal';
import ProfileModal from './components/ProfileModal/ProfileModal';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import Search from './pages/Search/Search';
import About from './pages/About/About';
import Contacts from './pages/Contacts/Contacts';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (token) {
          const response = await axios.get(`${API_URL}/users/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setCurrentUser(response.data);
        }
      } catch (error) {
        console.error('Ошибка проверки аутентификации:', error);
        localStorage.removeItem('token');
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleAuthSuccess = (userData) => {
    setCurrentUser(userData);
    setShowAuthModal(false);
  };

  const handleLogin = async (credentials) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      localStorage.setItem('token', response.data.token);
      handleAuthSuccess(response.data.user);
    } catch (error) {
      console.error('Ошибка входа:', error.response?.data?.message || error.message);
      alert(error.response?.data?.message || 'Ошибка входа');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (credentials) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/auth/register`, credentials);
      localStorage.setItem('token', response.data.token);
      handleAuthSuccess(response.data.user);
    } catch (error) {
      console.error('Ошибка регистрации:', error.response?.data?.message || error.message);
      alert(error.response?.data?.message || 'Ошибка регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setShowProfileModal(false);
    setShowAuthModal(false);
  };

  const handleSaveProfile = async (profileData) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('description', profileData.description);
      
      if (profileData.profilePicture) {
        formData.append('profilePicture', profileData.profilePicture);
      }
      
      if (profileData.photos) {
        profileData.photos.forEach(photo => {
          formData.append('portfolio', photo);
        });
      }

      const response = await axios.patch(
        `${API_URL}/users/me`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setCurrentUser(response.data);
      alert('Профиль успешно обновлен!');
    } catch (error) {
      console.error('Ошибка сохранения:', error.response?.data?.message || error.message);
      alert(error.response?.data?.message || 'Ошибка сохранения профиля');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Router>
      <div className="App">
        <Header 
          currentUser={currentUser}
          onAuthButtonClick={currentUser ? handleLogout : () => setShowAuthModal(true)}
          onProfileClick={() => currentUser && setShowProfileModal(true)}
        />
        
        <main className="main-content">
          {isLoading && <div className="loading-overlay">Загрузка...</div>}
          
          {currentUser && (
            <div className="auth-status">
              Вы вошли как: {currentUser.username} ({currentUser.role})
            </div>
          )}
          
          <Routes>
            <Route path="/" element={<Home currentUser={currentUser} />} />
            <Route path="/search" element={<Search currentUser={currentUser} />} />
            <Route path="/about" element={<About />} />
            <Route path="/contacts" element={<Contacts />} />
          </Routes>
        </main>
        
        <Footer />
        
        <AuthModal
          show={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          mode={authMode}
          onSwitchMode={(mode) => setAuthMode(mode)}
          onAuthSuccess={handleAuthSuccess}
          isLoading={isLoading}
          user={currentUser}
        />
        
        {currentUser && (
          <ProfileModal
            show={showProfileModal}
            onClose={() => setShowProfileModal(false)}
            user={currentUser}
            onLogout={handleLogout}
            onSaveProfile={handleSaveProfile}
            isLoading={isLoading}
          />
        )}
      </div>
    </Router>
  );
}

export default App;
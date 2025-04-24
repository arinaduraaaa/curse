import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import logo from './images/eye.jpg';

const Header = ({ currentUser, onAuthButtonClick, onProfileClick }) => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo-container">
          <img src={logo} alt="ShutterSeek Logo" className="logo-img" />
          <Link to="/" className="logo-text">ShutterSeek</Link>
        </div>
        
        <nav className="nav">
          <Link to="/">Главная</Link>
          <Link to="/search">Поиск фотографов</Link>
          <Link to="/about">О нас</Link>
          <Link to="/contacts">Контакты</Link>
        </nav>
        
        <div className="auth-section">
          {currentUser ? (
            <>
              <button className="profile-btn" onClick={onProfileClick}>
                Профиль
              </button>
              <button 
                className="logout-btn" 
                onClick={onAuthButtonClick}
              >
                Выйти
              </button>
            </>
          ) : (
            <button 
              className="login-btn" 
              onClick={onAuthButtonClick}
            >
              Войти
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
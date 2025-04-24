import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>ShutterSeek</h3>
          <p>Найдите идеального фотографа для вашей фотосессии</p>
        </div>

        <div className="footer-section">
          <h4>Навигация</h4>
          <ul>
            <li><Link to="/">Главная</Link></li>
            <li><Link to="/search">Поиск фотографов</Link></li>
            <li><Link to="/about">О нас</Link></li>
            <li><Link to="/contacts">Контакты</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Контакты</h4>
          <ul>
            <li>Email: contact@shutterseek.com</li>
            <li>Телефон: +7 (123) 456-78-90</li>
            <li>Адрес: г. Москва, ул. Примерная, 123</li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Соцсети</h4>
          <div className="social-links">
            <a href="#"><i className="fab fa-vk"></i></a>
            <a href="#"><i className="fab fa-telegram"></i></a>
            <a href="#"><i className="fab fa-instagram"></i></a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} ShutterSeek. Все права защищены.</p>
      </div>
    </footer>
  );
};

export default Footer;
import React from 'react';
import './Contacts.css';
import officePhoto from './images/phone.jpg';

const Contacts = () => {
  return (
    <div className="contacts-page">
      <div className="contacts-content">
        <h1>Контакты</h1>
        <p className="subtitle">Есть вопросы? Свяжитесь с нами:</p>
        
        <div className="contact-details">
          <ul className="contact-info">
            <li>
              <span className="contact-icon">✉️</span>
              <span>Email: contact@shutterseek.com</span>
            </li>
            <li>
              <span className="contact-icon">📞</span>
              <span>Телефон: +7 (123) 456-78-90</span>
            </li>
            <li>
              <span className="contact-icon">🏢</span>
              <span>Адрес: Москва, ул. Фотографическая, д. 10</span>
            </li>
            <li>
              <span className="contact-icon">⏰</span>
              <span>Часы работы: Пн-Пт 9:00-18:00</span>
            </li>
          </ul>
          
          <div className="contact-form">
            <h3>Напишите нам</h3>
            <form>
              <input type="text" placeholder="Ваше имя" />
              <input type="email" placeholder="Ваш email" />
              <textarea placeholder="Ваше сообщение"></textarea>
              <button type="submit">Отправить</button>
            </form>
          </div>
        </div>
      </div>
      
      {/* Блок с фотографией */}
      <div className="office-photo-section">
        <img src={officePhoto} alt="Наш офис" className="office-photo" />
        <div className="photo-caption">
          <p>Наш уютный офис, где мы готовы ответить на все ваши вопросы</p>
        </div>
      </div>
    </div>
  );
};

export default Contacts;
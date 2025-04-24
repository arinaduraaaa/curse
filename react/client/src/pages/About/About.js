import React from 'react';
import './About.css';
import teamPhoto from './assets/kitty.jpg'; // Предполагается, что у вас есть эта картинка в папке assets
import photographyIcon from './assets/eye.jpg'; // Иконка фотографии

const About = () => {
  return (
    <div className="about-page">
      <div className="about-header">
        <h1>О нашей компании</h1>
        <p className="subtitle">
          Создаём незабываемые воспоминания через искусство фотографии
        </p>
      </div>

      <div className="about-content">
        <div className="about-image">
          <img src={teamPhoto} alt="Наша команда фотографов" />
        </div>

        <div className="about-text">
          <h2>Наша миссия</h2>
          <p>
            Мы помогаем найти профессиональных фотографов для любых мероприятий - от свадеб и дней 
            рождения до корпоративных событий и fashion-съёмок.
          </p>

          <div className="features">
            <div className="feature-item">
              <img src={photographyIcon} alt="Иконка" className="feature-icon" />
              <h3>10+ лет опыта</h3>
              <p>Работаем на рынке фотоуслуг с 2013 года</p>
            </div>

            <div className="feature-item">
              <img src={photographyIcon} alt="Иконка" className="feature-icon" />
              <h3>500+ фотографов</h3>
              <p>Самая большая база проверенных специалистов</p>
            </div>

            <div className="feature-item">
              <img src={photographyIcon} alt="Иконка" className="feature-icon" />
              <h3>10,000+ событий</h3>
              <p>Успешно организовали съёмки для тысяч клиентов</p>
            </div>
          </div>
        </div>
      </div>

      <div className="testimonials">
        <h2>Отзывы наших клиентов</h2>
        <div className="testimonial-cards">
          <div className="testimonial">
            <p>"Нашли идеального фотографа для нашей свадьбы! Снимки получились волшебные."</p>
            <p className="author">- Анна и Михаил</p>
          </div>
          <div className="testimonial">
            <p>"Быстро подобрали профессионала для корпоративного мероприятия. Все остались довольны!"</p>
            <p className="author">- Олег, HR-директор</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
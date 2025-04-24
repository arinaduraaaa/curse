import React from 'react';
import './Home.css';
import image1 from './images/gallery1.jpg';
import image2 from './images/gallery2.jpg';
import image3 from './images/gallery3.jpg';

const Home = () => {
  return (
    <div className="home-page">
      <div className="full-width-container">
        <div className="gallery-row">
          <img src={image1} alt="Фотосессия 1" className="edge-touching-image" />
          <img src={image2} alt="Фотосессия 2" className="edge-touching-image" />
          <img src={image3} alt="Фотосессия 3" className="edge-touching-image" />
        </div>
        <div className="centered-text">
          <h1>Where moments meet their perfect frame</h1>
          <p className="subtitle">Найдите идеального фотографа для вашей фотосессии</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
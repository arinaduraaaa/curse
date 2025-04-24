import React, { useState, useEffect } from 'react';
import { supabase } from '../../client/AuthClient';
import './Search.css';

const specialties = [
  "Все специализации",
  "Свадебная фотография",
  "Портретная съемка",
  "Фэшн фотография",
  "Детская фотография",
  "Репортажная съемка",
  "Предметная съемка"
];

const Search = () => {
  const [city, setCity] = useState('');
  const [photographerName, setPhotographerName] = useState('');
  const [specialty, setSpecialty] = useState('Все специализации');
  const [results, setResults] = useState([]);
  const [allPhotographers, setAllPhotographers] = useState([]);
  const [cities, setCities] = useState([]);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedPhotographer, setSelectedPhotographer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [portfolioPhotos, setPortfolioPhotos] = useState([]); // Для хранения фото портфолио

  // Загрузка данных фотографов из Supabase
  useEffect(() => {
    const fetchPhotographers = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('shutterseek')
          .select('*')
          .eq('role', 'photographer');

        if (error) throw error;

        if (data) {
          setAllPhotographers(data);
          const uniqueCities = [...new Set(data.map(p => p.city))].filter(Boolean);
          setCities(uniqueCities);
        }
      } catch (error) {
        console.error('Ошибка загрузки фотографов:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhotographers();
  }, []);

  // Загрузка портфолио фотографа
  const loadPortfolio = async (photographer) => {
    if (!photographer.portfolio_photos) return [];
    
    try {
      // Если portfolio_photos это массив URL, просто возвращаем его
      if (Array.isArray(photographer.portfolio_photos)) {
        return photographer.portfolio_photos;
      }
      
      // Если это строка, пытаемся распарсить JSON
      try {
        const parsed = JSON.parse(photographer.portfolio_photos);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    } catch (error) {
      console.error('Ошибка загрузки портфолио:', error);
      return [];
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      let query = supabase
        .from('shutterseek')
        .select('*')
        .eq('role', 'photographer');

      if (city) query = query.ilike('city', `%${city}%`);
      if (photographerName) query = query.ilike('username', `%${photographerName}%`);
      if (specialty !== 'Все специализации') query = query.ilike('specialties', `%${specialty}%`);

      const { data, error } = await query;

      if (error) throw error;

      setResults(data || []);
      setIsSearchModalOpen(true);
    } catch (error) {
      console.error('Ошибка поиска:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openPhotographerProfile = async (photographer) => {
    setIsLoading(true);
    try {
      setSelectedPhotographer(photographer);
      // Загружаем фото портфолио перед открытием профиля
      const photos = await loadPortfolio(photographer);
      setPortfolioPhotos(photos);
      setIsProfileModalOpen(true);
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const closeSearchModal = () => {
    setIsSearchModalOpen(false);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
    setPortfolioPhotos([]);
  };

  const handleCitySelect = (selectedCity) => {
    setCity(selectedCity);
    setShowCitySuggestions(false);
  };

  const getAvatarUrl = (photographer) => {
    if (photographer.avatar_url) return photographer.avatar_url;
    return `https://ui-avatars.com/api/?name=${photographer.username || 'U'}&background=random`;
  };

  return (
    <div className="search-page">
      <h1>Найдите идеального фотографа</h1>
      <p className="search-subtitle">Профессиональные фотографы по всей России</p>
      
      <form onSubmit={handleSearch} className="search-form">
        <div className="form-row">
          <div className="form-group">
            <label>Город или регион</label>
            <div className="city-input-container">
              <input
                type="text"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setShowCitySuggestions(e.target.value.length > 0);
                }}
                placeholder="Например: Москва"
              />
              {showCitySuggestions && (
                <div className="city-suggestions">
                  {cities
                    .filter(c => c && c.toLowerCase().includes(city.toLowerCase()))
                    .map((cityOption, index) => (
                      <div 
                        key={index} 
                        className="suggestion-item"
                        onClick={() => handleCitySelect(cityOption)}
                      >
                        {cityOption}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="form-group">
            <label>Специальность фотографа</label>
            <select 
              value={specialty} 
              onChange={(e) => setSpecialty(e.target.value)}
              className="specialty-select"
            >
              {specialties.map((spec, index) => (
                <option key={index} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="form-group">
          <label>Имя фотографа (необязательно)</label>
          <input
            type="text"
            value={photographerName}
            onChange={(e) => setPhotographerName(e.target.value)}
            placeholder="Если знаете конкретного фотографа"
          />
        </div>
        
        <button type="submit" className="search-btn" disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="spinner"></span>
              Поиск...
            </>
          ) : 'Найти фотографов'}
        </button>
      </form>

      {/* Модальное окно с результатами поиска */}
      {isSearchModalOpen && (
        <div className="modal-overlay" onClick={closeSearchModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeSearchModal}>×</button>
            
            <h2>Результаты поиска</h2>
            <p className="search-criteria">
              {city && `Город: ${city} • `}
              {specialty !== 'Все специализации' && `Специальность: ${specialty}`}
              {!city && specialty === 'Все специализации' && 'Все фотографы'}
            </p>
            
            {results.length > 0 ? (
              <div className="photographers-grid">
                {results.map(photographer => (
                  <div 
                    key={photographer.id} 
                    className="photographer-card"
                    onClick={() => openPhotographerProfile(photographer)}
                  >
                    <div className="photographer-avatar">
                      <img 
                        src={getAvatarUrl(photographer)} 
                        alt={photographer.username} 
                        onError={(e) => {
                          e.target.src = 'https://ui-avatars.com/api/?name=U&background=random';
                        }}
                      />
                    </div>
                    <div className="photographer-info">
                      <h3>{photographer.username || 'Фотограф'}</h3>
                      <p className="specialty">{photographer.specialties || 'Специализация не указана'}</p>
                      <p className="location">{photographer.city || 'Город не указан'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png" 
                  alt="Ничего не найдено" 
                  className="no-results-img"
                />
                <h3>По вашему запросу ничего не найдено</h3>
                <p>Попробуйте изменить параметры поиска</p>
                <button 
                  onClick={() => {
                    closeSearchModal();
                    setCity('');
                    setSpecialty('Все специализации');
                    setPhotographerName('');
                  }} 
                  className="try-again-btn"
                >
                  Сбросить фильтры
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Модальное окно профиля фотографа */}
      {isProfileModalOpen && selectedPhotographer && (
        <div className="profile-modal-overlay" onClick={closeProfileModal}>
          <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeProfileModal}>×</button>
            
            <div className="photographer-profile-header">
              <div className="profile-avatar">
                <img 
                  src={getAvatarUrl(selectedPhotographer)} 
                  alt={selectedPhotographer.username} 
                />
              </div>
              <div className="profile-info">
                <h2>{selectedPhotographer.username || 'Фотограф'}</h2>
                <p className="profile-city">{selectedPhotographer.city || 'Город не указан'}</p>
                <div className="profile-rating">
                  ★ {selectedPhotographer.rating || 'Нет оценок'}
                </div>
              </div>
            </div>

            <div className="profile-sections">
              <div className="profile-section">
                <h3>О фотографе</h3>
                <p className="profile-description">
                  {selectedPhotographer.description || 'Описание отсутствует'}
                </p>
              </div>

              <div className="profile-section">
                <h3>Специализация</h3>
                <p className="profile-specialties">
                  {selectedPhotographer.specialties || 'Не указано'}
                </p>
              </div>

              <div className="profile-section">
                <h3>Оборудование</h3>
                <p className="profile-equipment">
                  {selectedPhotographer.equipment || 'Не указано'}
                </p>
              </div>

              {/* Блок портфолио */}
              <div className="profile-section">
                <h3>Портфолио</h3>
                {portfolioPhotos.length > 0 ? (
                  <div className="portfolio-grid">
                    {portfolioPhotos.slice(0, 6).map((photo, index) => (
                      <div key={index} className="portfolio-item">
                        <img 
                          src={photo} 
                          alt={`Работа фотографа ${index + 1}`}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/150?text=Фото+не+загружено';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-portfolio">Фотограф не загрузил работы в портфолио</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Блок популярных фотографов */}
      {!isSearchModalOpen && allPhotographers.length > 0 && (
        <div className="popular-photographers">
          <h2>Популярные фотографы</h2>
          <div className="photographers-grid">
            {allPhotographers.slice(0, 3).map(photographer => (
              <div 
                key={photographer.id} 
                className="photographer-card"
                onClick={() => openPhotographerProfile(photographer)}
              >
                <div className="photographer-avatar">
                  <img 
                    src={getAvatarUrl(photographer)} 
                    alt={photographer.username} 
                  />
                </div>
                <div className="photographer-info">
                  <h3>{photographer.username}</h3>
                  <p className="specialty">{photographer.specialties}</p>
                  <p className="location">{photographer.city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
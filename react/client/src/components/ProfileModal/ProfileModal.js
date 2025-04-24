import React, { useState, useEffect } from 'react';
import { supabase } from '../../client/AuthClient';
import './ProfileModal.css';

const ProfileModal = ({ 
  show, 
  onClose, 
  user, 
  onLogout,
  onSaveProfile 
}) => {
  const SPECIALIZATIONS = [
    'Свадебная фотография',
    'Портретная съемка',
    'Фэшн фотография',
    'Детская фотография',
    'Репортажная съемка',
    'Предметная съемка'
  ];

  const [profileData, setProfileData] = useState({
    description: '',
    specialties: '',
    equipment: '',
    role: '',
    city: ''
  });
  
  const [selectedSpecializations, setSelectedSpecializations] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [profilePicture, setProfilePicture] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!show || !user?.id) return;
      
      setIsFetching(true);
      setError(null);
      
      try {
        const { data, error: fetchError } = await supabase
          .from('shutterseek')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (fetchError) throw fetchError;
        
        let portfolioPhotos = [];
        if (data.portfolio_photos) {
          try {
            portfolioPhotos = Array.isArray(data.portfolio_photos) 
              ? data.portfolio_photos 
              : JSON.parse(data.portfolio_photos);
          } catch (e) {
            console.error('Error parsing portfolio photos:', e);
            portfolioPhotos = [];
          }
        }

        setProfileData({
          description: data.description || '',
          specialties: data.specialties || '',
          equipment: data.equipment || '',
          role: data.role?.toLowerCase() || 'client',
          city: data.city || ''
        });
        
        if (data.specialties) {
          const specialtiesArray = data.specialties.split(',').map(s => s.trim());
          setSelectedSpecializations(
            specialtiesArray.filter(s => SPECIALIZATIONS.includes(s))
          );
        } else {
          setSelectedSpecializations([]);
        }
        
        setPhotos(portfolioPhotos.filter(url => url && typeof url === 'string'));
        setProfilePicture(data.avatar_url || null);
      } catch (err) {
        console.error('Ошибка загрузки профиля:', err);
        setError('Не удалось загрузить данные профиля');
      } finally {
        setIsFetching(false);
      }
    };
    
    fetchProfileData();
  }, [show, user]);

  const handleSpecializationChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setSelectedSpecializations(selectedOptions);
    setProfileData({...profileData, specialties: selectedOptions.join(', ')});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({...profileData, [name]: value});
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.match('image.*')) {
      setError('Пожалуйста, выберите изображение');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Размер файла не должен превышать 2MB');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      if (profilePicture) {
        const oldAvatarPath = profilePicture.split('/').pop();
        await supabase.storage
          .from('avatars')
          .remove([oldAvatarPath]);
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('shutterseek')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfilePicture(publicUrl);
    } catch (err) {
      console.error('Ошибка загрузки аватара:', err);
      setError('Ошибка при загрузке аватара');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotosUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (files.length + photos.length > 20) {
      setError('Максимальное количество фото в портфолио - 20');
      return;
    }
  
    setIsLoading(true);
    setError(null);
  
    try {
      const uploadedUrls = [];
      
      for (const file of files) {
        if (!file.type.match('image.*')) {
          console.warn(`Файл ${file.name} не является изображением`);
          continue;
        }
  
        if (file.size > 5 * 1024 * 1024) {
          console.warn(`Файл ${file.name} слишком большой`);
          continue;
        }
  
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `portfolio/${fileName}`;
  
        const { error: uploadError } = await supabase.storage
          .from('portfolio')
          .upload(filePath, file);
  
        if (uploadError) throw uploadError;
  
        const { data: { publicUrl } } = supabase.storage
          .from('portfolio')
          .getPublicUrl(filePath);
        
        uploadedUrls.push(publicUrl);
      }
  
      if (uploadedUrls.length === 0) {
        throw new Error('Не удалось загрузить ни одного файла');
      }
  
      const newPhotos = [...photos, ...uploadedUrls];
      const { error: updateError } = await supabase
        .from('shutterseek')
        .update({ portfolio_photos: newPhotos })
        .eq('id', user.id);
  
      if (updateError) throw updateError;
  
      setPhotos(newPhotos);
    } catch (err) {
      console.error('Ошибка загрузки:', err);
      setError(err.message || 'Ошибка при загрузке фото');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePhoto = async (index) => {
    if (!window.confirm('Вы уверены, что хотите удалить это фото?')) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const photoToDelete = photos[index];
      if (!photoToDelete) return;

      const photoPath = photoToDelete.split('/portfolio/')[1];
      const { error: deleteError } = await supabase.storage
        .from('portfolio')
        .remove([`portfolio/${photoPath}`]);

      if (deleteError) throw deleteError;

      const newPhotos = [...photos];
      newPhotos.splice(index, 1);
      
      const { error: updateError } = await supabase
        .from('shutterseek')
        .update({ portfolio_photos: newPhotos })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setPhotos(newPhotos);
    } catch (err) {
      console.error('Ошибка удаления фото:', err);
      setError('Ошибка при удалении фото');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) {
      setError('Пользователь не определен');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const updates = {
        description: profileData.description,
        specialties: profileData.specialties,
        equipment: profileData.equipment,
        city: profileData.city,
        updated_at: new Date().toISOString(),
        portfolio_photos: photos
      };

      const { error: updateError } = await supabase
        .from('shutterseek')
        .update(updates)
        .eq('id', user.id);
  
      if (updateError) throw updateError;
  
      const { data } = await supabase
        .from('shutterseek')
        .select('*')
        .eq('id', user.id)
        .single();
  
      onSaveProfile(data);
      onClose();
    } catch (err) {
      console.error('Ошибка сохранения:', err);
      setError('Ошибка при сохранении профиля');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!show || !user) return null;

  return (
    <div className="profile-modal-overlay" onClick={handleBackdropClick}>
      <div className="profile-modal-container">
        <div className="profile-modal-header">
          <h2 className="profile-modal-title">Мой профиль</h2>
          <button className="profile-modal-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        {isFetching ? (
          <div className="profile-modal-loading">
            <div className="spinner"></div>
            <p>Загрузка данных профиля...</p>
          </div>
        ) : (
          <div className="profile-modal-content">
            {error && (
              <div className="error-message">
                {error}
                <button onClick={() => setError(null)}>×</button>
              </div>
            )}
            
            <div className="profile-section">
              <div className="avatar-upload">
                <div className="avatar-container">
                  {profilePicture ? (
                    <img 
                      src={profilePicture} 
                      alt="Аватар" 
                      className="avatar-image"
                      onError={() => setProfilePicture(null)}
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <label className="upload-button">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isLoading}
                  />
                  <span>{isLoading ? 'Загрузка...' : 'Изменить аватар'}</span>
                </label>
              </div>
              
              <div className="user-info">
                <h3 className="user-name">{user.username}</h3>
                <p className="user-email">{user.email}</p>
                <div className={`user-role ${profileData.role}`}>
                  {profileData.role === 'photographer' ? 'Фотограф' : 'Клиент'}
                </div>
              </div>
            </div>
            
            <div className="form-section">
              <div className="form-group">
                <label className="form-label">Город</label>
                <input
                  type="text"
                  name="city"
                  value={profileData.city}
                  onChange={handleInputChange}
                  placeholder="Введите ваш город"
                  className="form-input"
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">О себе</label>
                <textarea
                  value={profileData.description}
                  onChange={(e) => setProfileData({...profileData, description: e.target.value})}
                  placeholder="Расскажите о себе"
                  className="form-textarea"
                  disabled={isLoading}
                  rows="4"
                />
              </div>

              {profileData.role === 'photographer' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Специализация</label>
                    <select
                      multiple
                      value={selectedSpecializations}
                      onChange={handleSpecializationChange}
                      className="specialization-select"
                      disabled={isLoading}
                    >
                      {SPECIALIZATIONS.map((spec, index) => (
                        <option key={index} value={spec}>{spec}</option>
                      ))}
                    </select>
                    <div className="form-hint">Выберите один или несколько вариантов (удерживайте Ctrl для множественного выбора)</div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Мое оборудование</label>
                    <textarea
                      value={profileData.equipment}
                      onChange={(e) => setProfileData({...profileData, equipment: e.target.value})}
                      placeholder="Перечислите ваше фотооборудование..."
                      className="form-textarea"
                      disabled={isLoading}
                      rows="3"
                    />
                  </div>
                </>
              )}
            </div>
            
            {profileData.role === 'photographer' && (
              <div className="portfolio-section">
                <div className="portfolio-header">
                  <h3 className="portfolio-title">Портфолио</h3>
                  <span className="photo-count">{photos.length} фото</span>
                </div>
                
                {photos.length > 0 ? (
                  <div className="portfolio-grid">
                    {photos.map((photo, index) => (
                      <div key={index} className="portfolio-item">
                        <img 
                          src={photo} 
                          alt={`Фото портфолио ${index + 1}`} 
                          className="portfolio-image"
                          onError={() => {
                            const newPhotos = [...photos];
                            newPhotos.splice(index, 1);
                            setPhotos(newPhotos);
                          }}
                        />
                        <button 
                          className="delete-photo-button"
                          onClick={() => handleDeletePhoto(index)}
                          disabled={isLoading}
                          aria-label="Удалить фото"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-portfolio">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 16L8.5 10.5L11 14L14.5 9.5L20 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <p>Нет фотографий в портфолио</p>
                  </div>
                )}
                
                <label className="upload-button full-width">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotosUpload}
                    disabled={isLoading}
                  />
                  <span>{isLoading ? 'Загрузка...' : 'Добавить фото в портфолио'}</span>
                </label>
              </div>
            )}
            
            <div className="action-buttons">
              <button 
                className="save-button"
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="button-spinner"></span> Сохранение...
                  </>
                ) : 'Сохранить профиль'}
              </button>
              <button 
                className="logout-button"
                onClick={onLogout}
                disabled={isLoading}
              >
                Выйти
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileModal;
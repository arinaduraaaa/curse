import React, { useState, useEffect } from 'react';
import './AuthModal.css';
import { supabase } from '../../client/AuthClient';

const AuthModal = ({ 
  show, 
  onClose, 
  mode, 
  onSwitchMode, 
  onAuthSuccess = () => {},
  user
}) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: '' 
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
    username: '',
    general: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('shutterseek')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      // Убедимся, что роль всегда в нижнем регистре
      const normalizedProfile = {
        ...data,
        role: data.role?.toLowerCase() || 'client'
      };
      
      setUserProfile(normalizedProfile);
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '', general: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Некорректный email';
      isValid = false;
    }

    if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов';
      isValid = false;
    }

    if (mode === 'register') {
      if (formData.username.length < 3) {
        newErrors.username = 'Имя должно содержать минимум 3 символа';
        isValid = false;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
        newErrors.username = 'Имя может содержать только буквы, цифры и подчеркивания';
        isValid = false;
      }
      
      // Валидация роли
      if (!['client', 'photographer'].includes(formData.role.toLowerCase())) {
        newErrors.general = 'Некорректная роль пользователя';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUserProfile(null);
      onAuthSuccess(null);
    } catch (error) {
      console.error('Ошибка выхода:', error);
      setErrors(prev => ({
        ...prev,
        general: 'Ошибка при выходе из системы'
      }));
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
  
    setIsLoading(true);
    setErrors(prev => ({ ...prev, general: '' }));
  
    try {
      let response;
      const { email, password, username, role } = formData;
      const normalizedRole = role.toLowerCase();
  
      if (mode === 'login') {
        response = await supabase.auth.signInWithPassword({ email, password });
      } else {
        // Регистрация
        response = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
              role: normalizedRole,
              avatar_url: null
            }
          }
        });
  
        if (response.data?.user) {
          // Сохраняем профиль (только insert, без последующего update)
          const { error } = await supabase
            .from('shutterseek')
            .insert([{
              id: response.data.user.id, 
              username, 
              email, 
              role: normalizedRole,
              created_at: new Date().toISOString()
            }]);
  
          if (error) throw error;
        }
      }
  
      if (response.error) throw response.error;
      onAuthSuccess(response.data?.user || null);
      
    } catch (error) {
      console.error('Ошибка авторизации:', error);
      let errorMessage = 'Произошла ошибка';
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Неверный email или пароль';
      } else if (error.message.includes('User already registered')) {
        errorMessage = 'Пользователь с таким email уже зарегистрирован';
      } else {
        errorMessage = error.message;
      }
      setErrors({ ...errors, general: errorMessage });
    } finally {
      setIsLoading(false);
      // Сбрасываем форму, но сохраняем выбранную роль
      setFormData(prev => ({ ...prev, username: '', email: '', password: '' }));
    }
  };

  if (!show) return null;

  return (
    <div className="auth-modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        
        {user ? (
          <div className="user-profile">
            <h2>Профиль</h2>
            {userProfile && (
              <>
                <div className="profile-info">
                  <p><strong>Имя:</strong> {userProfile.username}</p>
                  <p><strong>Email:</strong> {userProfile.email}</p>
                  <p><strong>Роль:</strong> 
                    {userProfile.role === 'photographer' ? ' Фотограф' : ' Клиент'}
                  </p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="logout-btn"
                  disabled={isLoading}
                >
                  {isLoading ? <span className="spinner"></span> : 'Выйти'}
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            <h2>{mode === 'login' ? 'Вход' : 'Регистрация'}</h2>
            
            {errors.general && (
              <div className="error-message">{errors.general}</div>
            )}

            <form onSubmit={handleSubmit}>
              {mode === 'register' && (
                <>
                  <div className="form-group">
                    <label>Имя пользователя</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      placeholder="От 3 символов, без спецзнаков"
                    />
                    {errors.username && <span className="field-error">{errors.username}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label>Роль</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    >
                      <option value="client">Клиент</option>
                      <option value="photographer">Фотограф</option>
                    </select>
                  </div>
                </>
              )}
              
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  placeholder="example@mail.com"
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>
              
              <div className="form-group">
                <label>Пароль</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  placeholder="Не менее 6 символов"
                />
                {errors.password && <span className="field-error">{errors.password}</span>}
              </div>
              
              <button 
                type="submit" 
                className="submit-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="spinner"></span>
                ) : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
              </button>
            </form>
            
            <p className="switch-mode">
              {mode === 'login' ? (
                <>Нет аккаунта?{' '}
                  <button 
                    onClick={() => {
                      setErrors({
                        email: '',
                        password: '',
                        username: '',
                        general: ''
                      });
                      onSwitchMode('register');
                    }}
                    disabled={isLoading}
                  >
                    Зарегистрироваться
                  </button>
                </>
              ) : (
                <>Уже есть аккаунт?{' '}
                  <button 
                    onClick={() => {
                      setErrors({
                        email: '',
                        password: '',
                        username: '',
                        general: ''
                      });
                      onSwitchMode('login');
                    }}
                    disabled={isLoading}
                  >
                    Войти
                  </button>
                </>
              )}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
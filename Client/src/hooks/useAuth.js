import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

export const useAuth = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        // 토큰 확인
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        if (token) {
          // 토큰이 있으면 유저 정보 가져오기
          const response = await authAPI.getProfile();
          if (response.data.success) {
            setUser(response.data.data.user);
          }
        }
      } catch (error) {
        console.error('유저 정보 가져오기 실패:', error);
        // 토큰이 유효하지 않은 경우 로컬 스토리지에서 제거
        clearAuthData();
        // 토큰이 유효하지 않으면 로그인 페이지로 리다이렉트
        navigate('/login', { replace: true });
        return;
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [navigate]);

  const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  };

  const logout = () => {
    clearAuthData();
    setUser(null);
  };

  const isAdmin = () => {
    return user && user.user_type === 'admin';
  };

  return {
    user,
    loading,
    logout,
    isAdmin
  };
};
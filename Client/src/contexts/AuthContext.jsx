import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 컴포넌트 마운트 시 저장된 인증 정보 확인
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // localStorage 또는 sessionStorage에서 토큰과 사용자 정보 확인
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
        
        console.log('AuthContext: 저장된 토큰 확인:', !!token);
        console.log('AuthContext: 저장된 사용자 정보 확인:', !!userStr);
        
        if (token && userStr) {
          try {
            const userData = JSON.parse(userStr);
            setUser(userData);
            console.log('AuthContext: 저장된 인증 정보 복원됨', userData);
          } catch (parseError) {
            console.error('AuthContext: 사용자 정보 파싱 오류:', parseError);
            // 파싱 오류 시 저장된 데이터 정리
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
          }
        } else {
          console.log('AuthContext: 저장된 인증 정보 없음');
        }
      } catch (error) {
        console.error('AuthContext: 인증 상태 확인 중 오류:', error);
        // 오류 발생 시 저장된 데이터 정리
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // 로그인 함수
  const login = (userData, token, rememberMe = false) => {
    try {
      console.log('AuthContext: 로그인 함수 호출됨', { userData, tokenLength: token?.length, rememberMe });
      
      setUser(userData);
      
      // 항상 localStorage 사용 (일관성을 위해)
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // rememberMe가 false인 경우에도 sessionStorage에 백업 저장
      if (!rememberMe) {
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('user', JSON.stringify(userData));
      }
      
      console.log('AuthContext: 사용자 정보 localStorage에 저장됨');
      console.log('AuthContext: 저장된 토큰:', localStorage.getItem('token'));
      console.log('AuthContext: 저장된 사용자:', localStorage.getItem('user'));
      console.log('AuthContext: 로그인 완료', userData);
    } catch (error) {
      console.error('AuthContext: 로그인 처리 중 오류:', error);
    }
  };

  // 로그아웃 함수
  const logout = () => {
    try {
      console.log('AuthContext: 로그아웃 시작');
      
      // 사용자 상태 즉시 초기화
      setUser(null);
      
      // 모든 저장소에서 인증 정보 제거
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      
      // 추가적으로 다른 관련 데이터도 정리 (필요시)
      localStorage.removeItem('cartData');
      sessionStorage.removeItem('cartData');
      
      console.log('AuthContext: 로그아웃 완료 - 모든 인증 정보 제거됨');
    } catch (error) {
      console.error('AuthContext: 로그아웃 처리 중 오류:', error);
      // 오류 발생 시에도 사용자 상태는 초기화
      setUser(null);
    }
  };

  // 토큰 가져오기 함수
  const getToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  // 인증 상태 확인 함수
  const isAuthenticated = () => {
    return !!user && !!getToken();
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    getToken,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  const navigate = useNavigate();
  const { login: authLogin, isAuthenticated } = useAuth();

  // 컴포넌트 마운트 시 기존 토큰 확인
  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        // localStorage 또는 sessionStorage에서 토큰 확인
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        if (token) {
          console.log('기존 토큰 발견, 유효성 검사 중...');
          
          // 토큰이 있으면 유효성 검사를 위해 프로필 정보 요청
          const response = await authAPI.getProfile();
          
          if (response.data.success) {
            console.log('유효한 토큰 확인됨, 메인페이지로 리다이렉트');
            // 유효한 토큰이면 메인페이지로 리다이렉트
            navigate('/', { replace: true });
            return;
          }
        }
      } catch (error) {
        console.log('토큰 유효성 검사 실패 또는 토큰 없음:', error.message);
        // 토큰이 유효하지 않으면 저장소에서 제거
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkExistingAuth();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 입력 시 에러 메시지 제거
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // 클라이언트 사이드 유효성 검사
    if (!formData.email || !formData.password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      setIsLoading(false);
      return;
    }

    // 이메일 형식 검사
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(formData.email)) {
      setError('올바른 이메일 형식을 입력해주세요.');
      setIsLoading(false);
      return;
    }

    try {
      console.log('=== 로그인 시도 시작 ===');
      console.log('로그인 데이터:', { 
        email: formData.email.toLowerCase().trim(), 
        passwordLength: formData.password.length 
      });
      
      // 로그인 API 호출 (서버 authController.login과 일치)
      console.log('API 호출 전...');
      const response = await authAPI.login({
        email: formData.email.toLowerCase().trim(),
        password: formData.password
      });
      console.log('API 호출 완료');

      console.log('로그인 응답 전체:', response);
      console.log('로그인 응답 데이터:', response.data);

      // 서버 응답 구조에 맞춘 성공 처리
      if (response.data.success) {
        const { token, user } = response.data.data;
        
        console.log('로그인 성공 데이터:', { 
          user: user.name, 
          email: user.email, 
          tokenLength: token ? token.length : 0 
        });
        
        // AuthContext의 login 함수를 사용하여 전역 상태 업데이트
        console.log('AuthContext login 함수 호출 중...');
        authLogin(user, token, rememberMe);
        
        // 로그인 성공 메시지 (선택사항)
        console.log('서버 메시지:', response.data.message); // "로그인이 완료되었습니다"
        
        // 모든 사용자를 메인 페이지로 리다이렉트
        console.log('로그인 성공 - 메인 페이지로 이동 시작');
        navigate('/', { replace: true });
        console.log('navigate 호출 완료');
      } else {
        // 서버에서 success: false인 경우
        console.log('로그인 실패 - success: false');
        setError(response.data.message || '로그인에 실패했습니다.');
      }
      
    } catch (err) {
      console.error('=== 로그인 에러 발생 ===');
      console.error('에러 객체:', err);
      console.error('에러 메시지:', err.message);
      console.error('에러 응답:', err.response);
      
      // 서버 응답 에러 처리 (authController.js의 에러 응답과 일치)
      if (err.response?.data?.success === false) {
        // 서버에서 보낸 에러 메시지 사용
        setError(err.response.data.message);
      } else if (err.response?.status === 401) {
        // 인증 실패 (이메일 또는 비밀번호 불일치)
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      } else if (err.response?.status === 400) {
        // 유효성 검사 실패
        const errors = err.response.data.errors;
        if (errors && errors.length > 0) {
          setError(errors[0].msg);
        } else {
          setError('입력 데이터가 올바르지 않습니다.');
        }
      } else if (err.response?.status === 500) {
        // 서버 내부 오류
        setError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } else if (err.code === 'NETWORK_ERROR' || !err.response) {
        // 네트워크 오류
        setError('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.');
      } else {
        // 기타 오류
        setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 토큰 확인 중일 때 로딩 표시
  if (isCheckingAuth) {
    return (
      <div className="login-container">
        <div className="login-form">
          <div className="brand-logo">
            <h1>CIDER</h1>
          </div>
          <div className="login-header">
            <h2 className="login-title">로딩 중...</h2>
            <p className="login-subtitle">인증 상태를 확인하고 있습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-form">
        {/* 브랜드 로고 */}
        <div className="brand-logo">
          <h1>CIDER</h1>
        </div>

        {/* 로그인 헤더 */}
        <div className="login-header">
          <h2 className="login-title">로그인</h2>
          <p className="login-subtitle">계정에 로그인하여 쇼핑을 시작하세요</p>
        </div>

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit} className="login-form-content">
          {/* 이메일 입력 */}
          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your@email.com"
              required
            />
          </div>

          {/* 비밀번호 입력 */}
          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="비밀번호를 입력하세요"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* 로그인 옵션 */}
          <div className="login-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="checkmark"></span>
              로그인 상태 유지
            </label>
            <Link to="/forgot-password" className="forgot-password">
              비밀번호 찾기
            </Link>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* 로그인 버튼 */}
          <button 
            type="submit" 
            className={`login-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>

          {/* 구분선 */}
          <div className="divider">
            <span>또는</span>
          </div>

          {/* 소셜 로그인 버튼들 */}
          <div className="social-login">
            <button type="button" className="social-button google">
              <span className="social-icon">G</span>
              Google로 로그인
            </button>
            
            <button type="button" className="social-button facebook">
              <span className="social-icon">f</span>
              Facebook으로 로그인
            </button>
            
            <button type="button" className="social-button apple">
              <span className="social-icon">🍎</span>
              Apple로 로그인
            </button>
          </div>

          {/* 회원가입 링크 */}
          <div className="signup-link">
            아직 계정이 없으신가요? <Link to="/signup">회원가입</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
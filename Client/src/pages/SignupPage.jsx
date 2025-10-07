import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignupPage.css';

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreements: {
      all: false,
      terms: false,
      privacy: false,
      marketing: false
    }
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAgreementChange = (e) => {
    const { name, checked } = e.target;
    
    if (name === 'all') {
      setFormData(prev => ({
        ...prev,
        agreements: {
          all: checked,
          terms: checked,
          privacy: checked,
          marketing: checked
        }
      }));
    } else {
      setFormData(prev => {
        const newAgreements = {
          ...prev.agreements,
          [name]: checked
        };
        
        // 모든 개별 항목이 체크되면 전체 동의도 체크
        const allChecked = newAgreements.terms && newAgreements.privacy && newAgreements.marketing;
        newAgreements.all = allChecked;
        
        return {
          ...prev,
          agreements: newAgreements
        };
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 기본 유효성 검사
    if (!formData.name || !formData.email || !formData.password) {
      alert('모든 필수 항목을 입력해주세요.');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    
    if (!formData.agreements.terms || !formData.agreements.privacy) {
      alert('필수 약관에 동의해주세요.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('회원가입이 완료되었습니다!');
        // 메인 페이지로 이동
        navigate('/');
      } else {
        alert(data.message || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      console.error('회원가입 오류:', error);
      alert('서버 오류가 발생했습니다.');
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-form">
        <h1 className="signup-title">회원가입</h1>
        <p className="signup-subtitle">새로운 계정을 만들어 쇼핑을 시작하세요</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>이름</label>
            <input
              type="text"
              name="name"
              placeholder="이름을 입력하세요"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>이메일</label>
            <input
              type="email"
              name="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>비밀번호</label>
            <div className="password-input">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="비밀번호를 입력하세요"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                👁
              </button>
            </div>
            <small className="password-hint">8자 이상, 영문, 숫자, 특수문자 포함</small>
          </div>

          <div className="form-group">
            <label>비밀번호 확인</label>
            <div className="password-input">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="비밀번호를 다시 입력하세요"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                👁
              </button>
            </div>
          </div>

          <div className="agreements-section">
            <div className="agreement-item">
              <input
                type="checkbox"
                id="all"
                name="all"
                checked={formData.agreements.all}
                onChange={handleAgreementChange}
              />
              <label htmlFor="all" className="agreement-all">전체 동의</label>
            </div>

            <div className="agreement-item">
              <input
                type="checkbox"
                id="terms"
                name="terms"
                checked={formData.agreements.terms}
                onChange={handleAgreementChange}
              />
              <label htmlFor="terms">이용약관 동의 (필수)</label>
              <span className="required">보기</span>
            </div>

            <div className="agreement-item">
              <input
                type="checkbox"
                id="privacy"
                name="privacy"
                checked={formData.agreements.privacy}
                onChange={handleAgreementChange}
              />
              <label htmlFor="privacy">개인정보처리방침 동의 (필수)</label>
              <span className="required">보기</span>
            </div>

            <div className="agreement-item">
              <input
                type="checkbox"
                id="marketing"
                name="marketing"
                checked={formData.agreements.marketing}
                onChange={handleAgreementChange}
              />
              <label htmlFor="marketing">마케팅 정보 수신 동의 (선택)</label>
            </div>
          </div>

          <button type="submit" className="signup-button">
            회원가입
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
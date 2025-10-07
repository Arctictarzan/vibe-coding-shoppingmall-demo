import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { authAPI } from '../services/api';

const RegisterContainer = styled.div`
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const Button = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #0056b3;
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  background-color: #f8d7da;
  padding: 0.75rem;
  border-radius: 5px;
  margin-bottom: 1rem;
  text-align: center;
`;

const SuccessMessage = styled.div`
  color: #155724;
  background-color: #d4edda;
  padding: 0.75rem;
  border-radius: 5px;
  margin-bottom: 1rem;
  text-align: center;
`;

const LinkContainer = styled.div`
  text-align: center;
  margin-top: 1rem;
  
  a {
    color: #007bff;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🚀 === 폼 제출 시작 ===');
    console.log('현재 폼 데이터:', formData);
    setLoading(true);
    setError('');
    setSuccess('');

    if (!validateForm()) {
      console.log('폼 검증 실패');
      setLoading(false);
      return;
    }

    try {
      // authController.js의 register 엔드포인트에 맞는 데이터 구조
      const { confirmPassword, ...registerData } = formData;
      
      console.log('=== 회원가입 API 호출 시작 ===');
      console.log('전송할 데이터:', registerData);
      console.log('예상 URL:', 'http://localhost:5000/api/auth/register');
      console.log('환경변수 VITE_API_URL:', import.meta.env.VITE_API_URL);
      console.log('실제 baseURL:', import.meta.env.VITE_API_URL || 'http://localhost:5000/api');
      
      const response = await authAPI.register(registerData);
      
      console.log('=== API 호출 완료 ===');
      
      console.log('회원가입 응답 전체:', response);
      console.log('회원가입 응답 데이터:', response.data);
      
      if (response.data.success) {
        setSuccess('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
        
        // 토큰이 있다면 저장 (자동 로그인)
        if (response.data.data.token) {
          localStorage.setItem('token', response.data.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        
        // 2초 후 로그인 페이지로 이동
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
      
    } catch (err) {
      console.error('회원가입 오류 전체:', err);
      console.error('회원가입 오류 응답:', err.response);
      console.error('회원가입 오류 메시지:', err.message);
      setError(
        err.response?.data?.message || 
        err.message ||
        '회원가입에 실패했습니다. 다시 시도해주세요.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegisterContainer>
      <Title>회원가입</Title>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}
      
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="name">이름</Label>
          <Input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="이름을 입력하세요"
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="email">이메일</Label>
          <Input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="이메일을 입력하세요"
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="password">비밀번호</Label>
          <Input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="비밀번호를 입력하세요 (최소 6자)"
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="confirmPassword">비밀번호 확인</Label>
          <Input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            placeholder="비밀번호를 다시 입력하세요"
          />
        </FormGroup>
        
        <Button type="submit" disabled={loading}>
          {loading ? '가입 중...' : '회원가입'}
        </Button>
      </Form>
      
      <LinkContainer>
        <p>
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </p>
      </LinkContainer>
    </RegisterContainer>
  );
};

export default Register;
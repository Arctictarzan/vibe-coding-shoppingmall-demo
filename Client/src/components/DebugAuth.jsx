import React, { useState, useEffect } from 'react';

const DebugAuth = () => {
  const [localStorageData, setLocalStorageData] = useState({});
  const [sessionStorageData, setSessionStorageData] = useState({});
  const [serverUserInfo, setServerUserInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // localStorage 데이터 읽기
    const localData = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      try {
        localData[key] = JSON.parse(localStorage.getItem(key));
      } catch {
        localData[key] = localStorage.getItem(key);
      }
    }
    setLocalStorageData(localData);

    // sessionStorage 데이터 읽기
    const sessionData = {};
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      try {
        sessionData[key] = JSON.parse(sessionStorage.getItem(key));
      } catch {
        sessionData[key] = sessionStorage.getItem(key);
      }
    }
    setSessionStorageData(sessionData);

    // 서버에서 사용자 정보 가져오기
    const fetchUserInfo = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setServerUserInfo(userData);
          } else {
            setError(`Request failed with status code ${response.status}`);
          }
        } catch (err) {
          setError(err.message);
        }
      }
    };

    fetchUserInfo();
  }, []);

  const clearAllStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
    setLocalStorageData({});
    setSessionStorageData({});
    setServerUserInfo(null);
    setError(null);
    alert('모든 인증 정보가 삭제되었습니다. 페이지를 새로고침하세요.');
  };

  const clearSpecificData = (storageType, key) => {
    if (storageType === 'localStorage') {
      localStorage.removeItem(key);
      const newData = { ...localStorageData };
      delete newData[key];
      setLocalStorageData(newData);
    } else {
      sessionStorage.removeItem(key);
      const newData = { ...sessionStorageData };
      delete newData[key];
      setSessionStorageData(newData);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔍 인증 정보 디버깅</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={clearAllStorage}
          style={{ 
            backgroundColor: '#ff4444', 
            color: 'white', 
            padding: '10px 20px', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          모든 인증 정보 삭제
        </button>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>📱 클라이언트 저장소 정보</h2>
        
        <h3>localStorage</h3>
        <div style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '5px', marginBottom: '10px' }}>
          <pre>{JSON.stringify(localStorageData, null, 2)}</pre>
        </div>

        <h3>sessionStorage</h3>
        <div style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
          <pre>{JSON.stringify(sessionStorageData, null, 2)}</pre>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>🖥️ 서버 사용자 정보</h2>
        <div style={{ backgroundColor: '#f0f8ff', padding: '10px', borderRadius: '5px' }}>
          {error ? (
            <div style={{ color: 'red' }}>
              <strong>오류:</strong> {error}
            </div>
          ) : serverUserInfo ? (
            <pre>{JSON.stringify(serverUserInfo, null, 2)}</pre>
          ) : (
            <div>토큰이 없거나 서버에서 사용자 정보를 가져올 수 없습니다.</div>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>📊 분석</h2>
        <div style={{ backgroundColor: '#fff8dc', padding: '15px', borderRadius: '5px' }}>
          <h4>현재 상황:</h4>
          <ul>
            <li>localStorage 토큰: {localStorageData.token ? '✅ 있음' : '❌ 없음'}</li>
            <li>sessionStorage 토큰: {sessionStorageData.token ? '✅ 있음' : '❌ 없음'}</li>
            <li>localStorage 사용자: {localStorageData.user ? '✅ 있음' : '❌ 없음'}</li>
            <li>sessionStorage 사용자: {sessionStorageData.user ? '✅ 있음' : '❌ 없음'}</li>
            <li>서버 인증: {serverUserInfo ? '✅ 성공' : '❌ 실패'}</li>
          </ul>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>🔧 빠른 작업</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => window.location.href = '/login'}
            style={{ 
              backgroundColor: '#007bff', 
              color: 'white', 
              padding: '8px 16px', 
              border: 'none', 
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            로그인 페이지로
          </button>
          <button 
            onClick={() => window.location.href = '/orders'}
            style={{ 
              backgroundColor: '#28a745', 
              color: 'white', 
              padding: '8px 16px', 
              border: 'none', 
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            주문 페이지로
          </button>
          <button 
            onClick={() => window.location.reload()}
            style={{ 
              backgroundColor: '#6c757d', 
              color: 'white', 
              padding: '8px 16px', 
              border: 'none', 
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            페이지 새로고침
          </button>
        </div>
      </div>
    </div>
  );
};

export default DebugAuth;
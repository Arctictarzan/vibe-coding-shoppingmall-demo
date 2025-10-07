import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const DebugAuth = () => {
  const [debugInfo, setDebugInfo] = useState({});
  const [serverUserInfo, setServerUserInfo] = useState(null);

  useEffect(() => {
    checkAuthInfo();
  }, []);

  const checkAuthInfo = async () => {
    // localStorage 정보 확인
    const localToken = localStorage.getItem('token');
    const localUser = localStorage.getItem('user');
    
    // sessionStorage 정보 확인
    const sessionToken = sessionStorage.getItem('token');
    const sessionUser = sessionStorage.getItem('user');

    let parsedLocalUser = null;
    let parsedSessionUser = null;

    try {
      if (localUser) parsedLocalUser = JSON.parse(localUser);
    } catch (e) {
      console.error('localStorage user 파싱 오류:', e);
    }

    try {
      if (sessionUser) parsedSessionUser = JSON.parse(sessionUser);
    } catch (e) {
      console.error('sessionStorage user 파싱 오류:', e);
    }

    const info = {
      localStorage: {
        token: localToken,
        tokenLength: localToken ? localToken.length : 0,
        user: parsedLocalUser,
        userRaw: localUser
      },
      sessionStorage: {
        token: sessionToken,
        tokenLength: sessionToken ? sessionToken.length : 0,
        user: parsedSessionUser,
        userRaw: sessionUser
      }
    };

    setDebugInfo(info);

    // 서버에서 현재 토큰으로 사용자 정보 가져오기
    try {
      const response = await authAPI.getProfile();
      if (response.data.success) {
        setServerUserInfo(response.data.data.user);
      }
    } catch (error) {
      console.error('서버 사용자 정보 조회 실패:', error);
      setServerUserInfo({ error: error.message });
    }
  };

  const clearAllAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    alert('모든 인증 정보가 삭제되었습니다.');
    checkAuthInfo();
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🔍 인증 정보 디버깅</h1>
      
      <button onClick={checkAuthInfo} style={{ marginRight: '10px', padding: '10px' }}>
        새로고침
      </button>
      
      <button onClick={clearAllAuth} style={{ padding: '10px', backgroundColor: '#ff4444', color: 'white' }}>
        모든 인증 정보 삭제
      </button>

      <h2>📱 클라이언트 저장소 정보</h2>
      
      <h3>🗄️ localStorage</h3>
      <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
        {JSON.stringify(debugInfo.localStorage, null, 2)}
      </pre>

      <h3>💾 sessionStorage</h3>
      <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
        {JSON.stringify(debugInfo.sessionStorage, null, 2)}
      </pre>

      <h2>🖥️ 서버 사용자 정보</h2>
      <pre style={{ backgroundColor: '#e8f4fd', padding: '10px', overflow: 'auto' }}>
        {JSON.stringify(serverUserInfo, null, 2)}
      </pre>

      <h2>📊 분석</h2>
      <div style={{ backgroundColor: '#fff3cd', padding: '15px', border: '1px solid #ffeaa7' }}>
        <h4>현재 상황:</h4>
        <ul>
          <li>localStorage 토큰: {debugInfo.localStorage?.token ? '✅ 존재' : '❌ 없음'}</li>
          <li>sessionStorage 토큰: {debugInfo.sessionStorage?.token ? '✅ 존재' : '❌ 없음'}</li>
          <li>localStorage 사용자: {debugInfo.localStorage?.user ? `✅ ${debugInfo.localStorage.user.name} (${debugInfo.localStorage.user.email})` : '❌ 없음'}</li>
          <li>sessionStorage 사용자: {debugInfo.sessionStorage?.user ? `✅ ${debugInfo.sessionStorage.user.name} (${debugInfo.sessionStorage.user.email})` : '❌ 없음'}</li>
          <li>서버 인증: {serverUserInfo && !serverUserInfo.error ? `✅ ${serverUserInfo.name} (${serverUserInfo.email})` : '❌ 실패'}</li>
        </ul>
        
        {debugInfo.localStorage?.user && debugInfo.localStorage.user.email === 'immissingr1@gmail.com' && (
          <div style={{ color: 'red', fontWeight: 'bold', marginTop: '10px' }}>
            ⚠️ 문제 발견: localStorage에 'immissingr1@gmail.com' 사용자가 저장되어 있습니다!
            <br />
            데이터베이스에는 'immissingy1@gmail.com' 사용자만 존재합니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugAuth;
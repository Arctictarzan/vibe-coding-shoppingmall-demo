const jwt = require('jsonwebtoken');

/**
 * JWT 토큰 생성
 * @param {Object} payload - 토큰에 포함할 데이터
 * @param {Object} options - 토큰 옵션 (expiresIn, issuer 등)
 * @returns {string} JWT 토큰
 */
const generateToken = (payload, options = {}) => {
  const defaultOptions = {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    issuer: process.env.JWT_ISSUER || 'shopping-mall-demo'
  };

  const tokenOptions = { ...defaultOptions, ...options };
  
  return jwt.sign(payload, process.env.JWT_SECRET, tokenOptions);
};

/**
 * JWT 토큰 검증
 * @param {string} token - 검증할 토큰
 * @returns {Object} 디코딩된 토큰 데이터
 * @throws {Error} 토큰이 유효하지 않은 경우
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('유효하지 않은 토큰입니다.');
  }
};

/**
 * 리프레시 토큰 생성
 * @param {Object} payload - 토큰에 포함할 데이터
 * @returns {string} 리프레시 토큰
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
      issuer: process.env.JWT_ISSUER || 'shopping-mall-demo'
    }
  );
};

/**
 * 리프레시 토큰 검증
 * @param {string} refreshToken - 검증할 리프레시 토큰
 * @returns {Object} 디코딩된 토큰 데이터
 * @throws {Error} 토큰이 유효하지 않은 경우
 */
const verifyRefreshToken = (refreshToken) => {
  try {
    return jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );
  } catch (error) {
    throw new Error('유효하지 않은 리프레시 토큰입니다.');
  }
};

/**
 * 토큰에서 사용자 ID 추출
 * @param {string} token - JWT 토큰
 * @returns {string|null} 사용자 ID 또는 null
 */
const extractUserIdFromToken = (token) => {
  try {
    const decoded = verifyToken(token);
    return decoded.userId || decoded.id || null;
  } catch (error) {
    return null;
  }
};

/**
 * Authorization 헤더에서 토큰 추출
 * @param {string} authHeader - Authorization 헤더 값
 * @returns {string|null} 추출된 토큰 또는 null
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.split(' ')[1];
};

/**
 * 토큰 만료 시간 확인
 * @param {string} token - JWT 토큰
 * @returns {boolean} 토큰이 만료되었는지 여부
 */
const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

/**
 * 토큰 만료까지 남은 시간 (초)
 * @param {string} token - JWT 토큰
 * @returns {number} 남은 시간 (초), 만료된 경우 0
 */
const getTokenRemainingTime = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return 0;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    const remainingTime = decoded.exp - currentTime;
    
    return Math.max(0, remainingTime);
  } catch (error) {
    return 0;
  }
};

/**
 * 토큰 디코딩 (검증 없이)
 * @param {string} token - JWT 토큰
 * @returns {Object|null} 디코딩된 토큰 데이터 또는 null
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

/**
 * 사용자 정보로 토큰 페어 생성
 * @param {Object} user - 사용자 객체
 * @returns {Object} { accessToken, refreshToken }
 */
const generateTokenPair = (user) => {
  const payload = {
    userId: user._id || user.id,
    email: user.email,
    role: user.user_type || user.role
  };

  const accessToken = generateToken(payload);
  const refreshToken = generateRefreshToken({ userId: payload.userId });

  return {
    accessToken,
    refreshToken
  };
};

/**
 * 토큰 검증 결과 객체 생성
 * @param {string} token - 검증할 토큰
 * @returns {Object} { isValid, decoded, error }
 */
const validateToken = (token) => {
  try {
    const decoded = verifyToken(token);
    return {
      isValid: true,
      decoded,
      error: null
    };
  } catch (error) {
    return {
      isValid: false,
      decoded: null,
      error: error.message
    };
  }
};

module.exports = {
  generateToken,
  verifyToken,
  generateRefreshToken,
  verifyRefreshToken,
  extractUserIdFromToken,
  extractTokenFromHeader,
  isTokenExpired,
  getTokenRemainingTime,
  decodeToken,
  generateTokenPair,
  validateToken
};
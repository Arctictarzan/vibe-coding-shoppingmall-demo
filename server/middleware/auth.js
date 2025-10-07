const User = require('../models/User');
const jwtUtils = require('../utils/jwtUtils');

/**
 * 사용자 정보 객체 생성
 * @param {Object} user - 사용자 모델 객체
 * @returns {Object} 표준화된 사용자 정보 객체
 */
const createUserInfo = (user) => {
  return {
    userId: user._id,
    _id: user._id,
    email: user.email,
    name: user.name,
    role: user.user_type,
    user_type: user.user_type,
    isActive: user.isActive,
    createdAt: user.createdAt
  };
};

/**
 * JWT 토큰 검증 미들웨어
 * 필수 인증이 필요한 라우트에서 사용
 */
exports.authenticate = async (req, res, next) => {
  try {
    console.log('인증 미들웨어 실행:', {
      url: req.url,
      method: req.method,
      authHeader: req.headers.authorization ? 'Bearer 토큰 존재' : '토큰 없음'
    });

    // Authorization 헤더에서 토큰 추출
    const token = jwtUtils.extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      console.log('토큰이 없음 - 401 반환');
      return res.status(401).json({
        success: false,
        message: '접근 권한이 없습니다. 로그인이 필요합니다.',
        code: 'TOKEN_MISSING'
      });
    }

    // 토큰 검증
    const validation = jwtUtils.validateToken(token);
    if (!validation.isValid) {
      console.log('토큰 검증 실패:', validation.error);
      return res.status(401).json({
        success: false,
        message: validation.error,
        code: 'TOKEN_INVALID'
      });
    }

    // 사용자 정보 조회
    const user = await User.findById(validation.decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.',
        code: 'USER_NOT_FOUND'
      });
    }

    // 사용자 계정 활성화 상태 확인
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: '비활성화된 계정입니다.',
        code: 'USER_INACTIVE'
      });
    }

    // req 객체에 사용자 정보 추가
    req.user = createUserInfo(user);
    req.token = token;

    next();

  } catch (error) {
    console.error('인증 미들웨어 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      code: 'SERVER_ERROR'
    });
  }
};

/**
 * 역할 기반 권한 확인 미들웨어
 * @param {...string} roles - 허용할 역할들
 * @returns {Function} 미들웨어 함수
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: '이 작업을 수행할 권한이 없습니다.',
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: roles,
        userRole: req.user.role
      });
    }

    next();
  };
};

/**
 * 관리자 전용 미들웨어
 */
exports.requireAdmin = exports.authorize('admin');

/**
 * 사용자 또는 관리자 권한 확인 미들웨어
 */
exports.requireUserOrAdmin = exports.authorize('user', 'admin');

/**
 * 본인 또는 관리자만 접근 가능한 미들웨어
 * @param {string} userIdParam - URL 파라미터에서 사용자 ID를 가져올 키 (기본값: 'userId')
 */
exports.requireOwnerOrAdmin = (userIdParam = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    const targetUserId = req.params[userIdParam] || req.body.userId || req.query.userId;
    const isOwner = req.user.userId.toString() === targetUserId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: '본인 또는 관리자만 접근할 수 있습니다.',
        code: 'ACCESS_DENIED'
      });
    }

    next();
  };
};

/**
 * 계정 활성화 상태 확인 미들웨어
 */
exports.requireActiveAccount = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: '인증이 필요합니다.',
      code: 'AUTHENTICATION_REQUIRED'
    });
  }

  if (!req.user.isActive) {
    return res.status(403).json({
      success: false,
      message: '비활성화된 계정입니다. 관리자에게 문의하세요.',
      code: 'ACCOUNT_INACTIVE'
    });
  }

  next();
};

/**
 * API 키 기반 인증 미들웨어
 * 외부 API 호출이나 웹훅에서 사용
 */
exports.requireApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'API 키가 필요합니다.',
      code: 'API_KEY_MISSING'
    });
  }

  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({
      success: false,
      message: '유효하지 않은 API 키입니다.',
      code: 'API_KEY_INVALID'
    });
  }

  next();
};

/**
 * 요청 제한 미들웨어 (간단한 rate limiting)
 * @param {number} maxRequests - 최대 요청 수
 * @param {number} windowMs - 시간 윈도우 (밀리초)
 */
exports.rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    const identifier = req.user ? req.user.userId : req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    // 기존 요청 기록 정리
    if (requests.has(identifier)) {
      const userRequests = requests.get(identifier).filter(time => time > windowStart);
      requests.set(identifier, userRequests);
    }

    const currentRequests = requests.get(identifier) || [];

    if (currentRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    // 현재 요청 기록
    currentRequests.push(now);
    requests.set(identifier, currentRequests);

    next();
  };
};

/**
 * 선택적 인증 미들웨어
 * 토큰이 있으면 검증하고, 없어도 통과시킴
 * 공개 API에서 로그인 상태에 따라 다른 응답을 제공할 때 사용
 */
exports.optionalAuth = async (req, res, next) => {
  try {
    // Authorization 헤더에서 토큰 추출
    const token = jwtUtils.extractTokenFromHeader(req.headers.authorization);

    if (token) {
      // 토큰 검증
      const validation = jwtUtils.validateToken(token);
      
      if (validation.isValid) {
        // 사용자 정보 조회
        const user = await User.findById(validation.decoded.userId);
        
        if (user && user.isActive) {
          req.user = createUserInfo(user);
          req.token = token;
        }
      }
      // 토큰이 유효하지 않거나 사용자가 없어도 계속 진행
    }

    next();

  } catch (error) {
    console.error('선택적 인증 미들웨어 오류:', error);
    next(); // 오류가 있어도 계속 진행
  }
};

/**
 * 토큰 새로고침 미들웨어
 * 리프레시 토큰을 사용하여 새로운 액세스 토큰 발급
 */
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: '리프레시 토큰이 필요합니다.',
        code: 'REFRESH_TOKEN_MISSING'
      });
    }

    // 리프레시 토큰 검증
    let decoded;
    try {
      decoded = jwtUtils.verifyRefreshToken(refreshToken);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: '유효하지 않은 리프레시 토큰입니다.',
        code: 'REFRESH_TOKEN_INVALID'
      });
    }

    // 사용자 정보 조회
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: '사용자를 찾을 수 없거나 비활성화된 계정입니다.',
        code: 'USER_NOT_FOUND_OR_INACTIVE'
      });
    }

    // 새로운 토큰 페어 생성
    const tokenPair = jwtUtils.generateTokenPair(user);

    res.json({
      success: true,
      data: {
        accessToken: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken,
        user: createUserInfo(user)
      },
      message: '토큰이 성공적으로 갱신되었습니다.'
    });

  } catch (error) {
    console.error('토큰 새로고침 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      code: 'SERVER_ERROR'
    });
  }
};
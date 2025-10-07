const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// 회원가입 유효성 검사 미들웨어
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('이름은 2-50자 사이여야 합니다'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('유효한 이메일 주소를 입력해주세요'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('비밀번호는 최소 6자 이상이어야 합니다'),
  body('phone')
    .optional()
    .isMobilePhone('ko-KR')
    .withMessage('유효한 전화번호를 입력해주세요')
];

// 로그인 유효성 검사 미들웨어
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('유효한 이메일 주소를 입력해주세요'),
  body('password')
    .notEmpty()
    .withMessage('비밀번호를 입력해주세요')
];

// 회원가입
router.post('/register', registerValidation, authController.register);

// 로그인
router.post('/login', loginValidation, authController.login);

// 로그아웃
router.post('/logout', authController.logout);

// 프로필 조회 (토큰으로 유저 정보 가져오기)
router.get('/profile', authenticate, authController.getProfile);

// 토큰 유효성 검증
router.get('/verify-token', authenticate, authController.verifyToken);

// 현재 사용자 정보 조회 (별칭)
router.get('/me', authenticate, authController.getProfile);

module.exports = router;
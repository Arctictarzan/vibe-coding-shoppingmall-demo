const User = require('../models/User');
const jwtUtils = require('../utils/jwtUtils');
const { validationResult } = require('express-validator');

// 회원가입
exports.register = async (req, res) => {
  try {
    // 유효성 검사 결과 확인
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '입력 데이터가 올바르지 않습니다',
        errors: errors.array()
      });
    }

    const { name, email, password } = req.body;

    // 이미 존재하는 사용자 확인
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '이미 등록된 이메일입니다'
      });
    }

    // 새 사용자 생성
    const user = await User.create({
      name,
      email,
      password
    });

    // JWT 토큰 생성
    const token = jwtUtils.generateToken({ userId: user._id });

    res.status(201).json({
      success: true,
      message: '회원가입이 완료되었습니다',
      data: {
        user,
        token
      }
    });

  } catch (error) {
    console.error('회원가입 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다'
    });
  }
};

// 로그인
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '입력 데이터가 올바르지 않습니다',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // 사용자 찾기 (비밀번호 포함)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다'
      });
    }

    // 비밀번호 확인
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다'
      });
    }

    // 마지막 로그인 시간 업데이트
    user.lastLogin = new Date();
    await user.save();

    // JWT 토큰 생성
    const token = jwtUtils.generateToken({ userId: user._id });

    res.json({
      success: true,
      message: '로그인이 완료되었습니다',
      data: {
        user,
        token
      }
    });

  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다'
    });
  }
};

// 토큰으로 유저 정보 조회
exports.getProfile = async (req, res) => {
  try {
    // JWT 미들웨어에서 이미 검증된 사용자 ID 사용
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다'
      });
    }

    res.json({
      success: true,
      message: '사용자 정보 조회 성공',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          user_type: user.user_type,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('프로필 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다'
    });
  }
};

// 토큰 유효성 검증 (토큰이 유효한지만 확인)
exports.verifyToken = async (req, res) => {
  try {
    // JWT 미들웨어를 통과했다면 토큰이 유효함
    res.json({
      success: true,
      message: '토큰이 유효합니다',
      data: {
        userId: req.user.userId,
        email: req.user.email,
        name: req.user.name,
        user_type: req.user.user_type
      }
    });

  } catch (error) {
    console.error('토큰 검증 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다'
    });
  }
};

// 로그아웃 (클라이언트에서 토큰 삭제)
exports.logout = (req, res) => {
  res.json({
    success: true,
    message: '로그아웃이 완료되었습니다'
  });
};
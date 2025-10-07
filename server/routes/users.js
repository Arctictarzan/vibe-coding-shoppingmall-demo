const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  updatePassword,
  deleteUser,
  getUserStats
} = require('../controllers/usersController');

// CREATE - 새 유저 생성 (회원가입)
router.post('/', createUser);

// READ - 모든 유저 조회 (관리자만)
router.get('/', authenticate, authorize('admin'), getAllUsers);

// READ - 특정 유저 조회
router.get('/:id', authenticate, getUserById);

// UPDATE - 유저 정보 수정
router.put('/:id', authenticate, updateUser);

// UPDATE - 비밀번호 변경
router.put('/:id/password', authenticate, updatePassword);

// DELETE - 유저 삭제
router.delete('/:id', authenticate, deleteUser);

// GET - 유저 통계 (관리자만)
router.get('/stats/overview', authenticate, authorize('admin'), getUserStats);

module.exports = router;
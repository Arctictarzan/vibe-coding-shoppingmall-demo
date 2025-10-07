const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// 모든 주문 라우트는 인증이 필요
router.use(authenticate);

// === 사용자 주문 관련 라우트 ===

// 주문 생성 (장바구니에서 주문으로 변환)
router.post('/', orderController.createOrder);

// 결제 검증 및 주문 완료 처리
router.post('/verify-payment', orderController.verifyAndCompletePayment);

// 사용자의 주문 목록 조회
router.get('/my-orders', orderController.getUserOrders);

// 특정 주문 상세 조회
router.get('/:orderId', orderController.getOrderById);

// 주문 취소
router.patch('/:orderId/cancel', orderController.cancelOrder);

// === 관리자 전용 라우트 ===

// 모든 주문 조회 (관리자) - userId 쿼리 파라미터 지원
router.get('/', requireAdmin, orderController.getAllOrders);

// 모든 주문 조회 (관리자)
router.get('/admin/all', requireAdmin, orderController.getAllOrders);

// 주문 상태 업데이트 (관리자)
router.patch('/admin/:orderId/status', requireAdmin, orderController.updateOrderStatus);

// 주문 통계 조회 (관리자)
router.get('/admin/stats', requireAdmin, orderController.getOrderStats);

module.exports = router;
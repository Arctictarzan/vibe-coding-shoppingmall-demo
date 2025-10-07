const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getAllProducts,
  getProductById,
  getProductBySku,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategoryStats,
  getNextSku
} = require('../controllers/productsController');

// 모든 상품 조회 (공개)
router.get('/', getAllProducts);

// 특정 상품 조회 (공개)
router.get('/:id', getProductById);

// SKU로 상품 조회 (공개)
router.get('/sku/:sku', getProductBySku);

// 상품 생성 (관리자만)
router.post('/', authenticate, createProduct);

// 상품 수정 (관리자만)
router.put('/:id', authenticate, updateProduct);

// 상품 삭제 (관리자만)
router.delete('/:id', authenticate, deleteProduct);

// 카테고리별 상품 수 조회 (공개)
router.get('/stats/categories', getCategoryStats);

// 다음 SKU 생성 (관리자만)
router.get('/utils/next-sku/:category', authenticate, getNextSku);

module.exports = router;
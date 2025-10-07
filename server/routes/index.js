const express = require('express');
const router = express.Router();

// 기본 API 라우트
router.get('/', (req, res) => {
  res.json({
    message: 'Shopping Mall API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      products: '/api/products',
      orders: '/api/orders',
      auth: '/api/auth'
    }
  });
});

module.exports = router;
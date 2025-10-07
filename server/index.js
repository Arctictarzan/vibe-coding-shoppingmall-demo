const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// 환경변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어 설정 - 유연한 CORS 설정
const corsOptions = {
  origin: function (origin, callback) {
    // 허용할 도메인들
     const allowedOrigins = [
       'http://localhost:5173', // 로컬 개발
       'http://localhost:3000', // 로컬 개발 (추가)
       process.env.CLIENT_URL, // 기존 환경변수 (호환성)
       process.env.FRONTEND_URL // 새로운 환경변수
     ].filter(Boolean);

    // origin이 없거나 (Postman 등), vercel.app 도메인이거나, 허용된 도메인인 경우
    if (!origin || 
        origin.includes('vercel.app') || 
        allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS 차단된 도메인:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB 연결
const connectDB = async () => {
  try {
    // 간단하고 명확한 2단계 구조: Atlas 클라우드 또는 로컬
    const mongoUri = process.env.MONGODB_ALTAS_URL || 'mongodb://localhost:27017/shopping-mall';
    
    await mongoose.connect(mongoUri);
    console.log('MongoDB 연결 성공');
  } catch (error) {
    console.error('MongoDB 연결 실패:', error.message);
    process.exit(1);
  }
};

// 데이터베이스 연결
connectDB();

// 라우트 import
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const productsRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ 
    message: 'Shopping Mall API Server가 정상적으로 실행 중입니다!',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api'
    }
  });
});

// 헬스 체크 라우트
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API 라우트 등록
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// 404 API 에러 핸들링
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API 엔드포인트를 찾을 수 없습니다.' });
});

// 404 에러 핸들링
app.use('*', (req, res) => {
  res.status(404).json({ message: '요청한 리소스를 찾을 수 없습니다.' });
});

// 전역 에러 핸들링
app.use((error, req, res, next) => {
  console.error('서버 에러:', error);
  res.status(500).json({ 
    message: '서버 내부 오류가 발생했습니다.',
    error: process.env.NODE_ENV === 'development' ? error.message : {}
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`http://localhost:${PORT} 에서 접속 가능합니다.`);
});

module.exports = app;
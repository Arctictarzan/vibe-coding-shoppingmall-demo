const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // 간단하고 명확한 2단계 구조: Atlas 클라우드 또는 로컬
    const mongoUri = process.env.MONGODB_ALTAS_URL || 'mongodb://localhost:27017/shopping-mall';
    
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB 연결 성공: ${conn.connection.host}`);
    
    // 연결 이벤트 리스너
    mongoose.connection.on('connected', () => {
      console.log('Mongoose가 MongoDB에 연결되었습니다.');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB 연결 오류:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB 연결이 끊어졌습니다.');
    });

    // 프로세스 종료 시 연결 정리
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB 연결이 정상적으로 종료되었습니다.');
      process.exit(0);
    });

  } catch (error) {
    console.error('MongoDB 연결 실패:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
# Shopping Mall Server

Node.js, Express, MongoDB를 사용한 쇼핑몰 백엔드 서버입니다.

## 🚀 시작하기

### 필수 요구사항

- Node.js (v14 이상)
- MongoDB (로컬 또는 MongoDB Atlas)
- npm 또는 yarn

### 설치 및 실행

1. **의존성 설치**
   ```bash
   npm install
   ```

2. **환경변수 설정**
   ```bash
   # .env.example을 복사하여 .env 파일 생성
   cp .env.example .env
   
   # .env 파일을 열어 필요한 값들을 설정
   ```

3. **MongoDB 연결 설정**
   - 로컬 MongoDB: `mongodb://localhost:27017/shopping-mall`
   - MongoDB Atlas: 연결 문자열을 .env 파일의 MONGODB_URI에 설정

4. **서버 실행**
   ```bash
   # 개발 모드 (nodemon 사용)
   npm run dev
   
   # 프로덕션 모드
   npm start
   ```

5. **서버 확인**
   - 브라우저에서 `http://localhost:5000` 접속
   - 정상 작동 시 환영 메시지가 표시됩니다

## 📁 프로젝트 구조

```
server/
├── config/
│   └── database.js          # MongoDB 연결 설정
├── controllers/
│   └── authController.js    # 인증 관련 컨트롤러
├── middleware/
│   └── auth.js              # 인증 미들웨어
├── models/
│   ├── User.js              # 사용자 모델
│   └── Product.js           # 상품 모델
├── routes/
│   ├── index.js             # 기본 라우트
│   ├── auth.js              # 인증 라우트
│   └── products.js          # 상품 라우트
├── .env                     # 환경변수 (git에서 제외)
├── .env.example             # 환경변수 템플릿
├── .gitignore               # Git 제외 파일 목록
├── package.json             # 프로젝트 설정 및 의존성
├── server.js                # 메인 서버 파일
└── README.md                # 프로젝트 문서
```

## 🔧 환경변수 설정

`.env` 파일에서 다음 변수들을 설정하세요:

```env
# 서버 설정
PORT=5000
NODE_ENV=development

# MongoDB 설정
MONGODB_URI=mongodb://localhost:27017/shopping-mall

# JWT 설정
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d

# 기타 설정
BCRYPT_SALT_ROUNDS=12

# CORS 설정 (프론트엔드 URL)
CLIENT_URL=http://localhost:3000
```

## 📚 API 엔드포인트

### 기본 엔드포인트

- `GET /` - 서버 상태 확인
- `GET /health` - 헬스 체크

### 인증 API

- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `GET /api/auth/profile` - 프로필 조회 (인증 필요)

### 상품 API

- `GET /api/products` - 상품 목록 조회
- `GET /api/products/:id` - 특정 상품 조회
- `POST /api/products` - 상품 생성 (관리자 권한 필요)
- `PUT /api/products/:id` - 상품 수정 (관리자 권한 필요)
- `DELETE /api/products/:id` - 상품 삭제 (관리자 권한 필요)

## 🛠️ 개발 도구

### 사용된 패키지

- **express**: 웹 프레임워크
- **mongoose**: MongoDB ODM
- **bcryptjs**: 비밀번호 암호화
- **jsonwebtoken**: JWT 토큰 생성/검증
- **cors**: CORS 설정
- **dotenv**: 환경변수 관리
- **express-validator**: 입력 데이터 검증
- **nodemon**: 개발 시 자동 재시작

### 개발 명령어

```bash
# 개발 서버 실행 (자동 재시작)
npm run dev

# 프로덕션 서버 실행
npm start

# 테스트 실행 (추후 구현)
npm test
```

## 🔐 보안 고려사항

1. **환경변수**: 민감한 정보는 반드시 환경변수로 관리
2. **JWT Secret**: 프로덕션에서는 강력한 시크릿 키 사용
3. **비밀번호**: bcrypt를 사용한 해싱
4. **CORS**: 필요한 도메인만 허용
5. **입력 검증**: express-validator를 사용한 데이터 검증

## 📝 추가 개발 예정 기능

- [ ] 주문 관리 시스템
- [ ] 장바구니 기능
- [ ] 상품 리뷰 시스템
- [ ] 파일 업로드 (이미지)
- [ ] 이메일 인증
- [ ] 소셜 로그인
- [ ] 결제 시스템 연동
- [ ] 관리자 대시보드

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 ISC 라이선스 하에 있습니다.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.
# Users API 테스트 가이드

## API 엔드포인트

### 1. 새 유저 생성 (회원가입)
```http
POST http://localhost:5000/api/users
Content-Type: application/json

{
  "email": "test@example.com",
  "name": "테스트 유저",
  "password": "password123",
  "user_type": "customer",
  "address": {
    "street": "서울시 강남구",
    "city": "서울",
    "state": "서울특별시",
    "zipCode": "12345",
    "country": "Korea"
  }
}
```

### 2. 모든 유저 조회 (관리자만)
```http
GET http://localhost:5000/api/users
Authorization: Bearer {JWT_TOKEN}
```

### 3. 특정 유저 조회
```http
GET http://localhost:5000/api/users/{USER_ID}
Authorization: Bearer {JWT_TOKEN}
```

### 4. 유저 정보 수정
```http
PUT http://localhost:5000/api/users/{USER_ID}
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "name": "수정된 이름",
  "email": "updated@example.com",
  "address": {
    "street": "수정된 주소",
    "city": "부산",
    "state": "부산광역시",
    "zipCode": "54321",
    "country": "Korea"
  }
}
```

### 5. 비밀번호 변경
```http
PUT http://localhost:5000/api/users/{USER_ID}/password
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "currentPassword": "password123",
  "newPassword": "newpassword456"
}
```

### 6. 유저 삭제
```http
DELETE http://localhost:5000/api/users/{USER_ID}
Authorization: Bearer {JWT_TOKEN}
```

### 7. 유저 통계 조회 (관리자만)
```http
GET http://localhost:5000/api/users/stats/overview
Authorization: Bearer {JWT_TOKEN}
```

## 응답 형식

### 성공 응답
```json
{
  "success": true,
  "message": "작업이 성공적으로 완료되었습니다.",
  "data": {
    // 응답 데이터
  }
}
```

### 오류 응답
```json
{
  "success": false,
  "message": "오류 메시지",
  "error": "상세 오류 정보"
}
```

## 권한 시스템

- **인증 필요**: 대부분의 API는 JWT 토큰이 필요합니다
- **본인 또는 관리자**: 특정 유저 조회, 수정, 삭제는 본인 또는 관리자만 가능
- **관리자만**: 모든 유저 조회, 유저 통계는 관리자만 접근 가능
- **본인만**: 비밀번호 변경은 본인만 가능

## 유저 타입

- `customer`: 일반 고객 (기본값)
- `admin`: 관리자

## 주의사항

1. 비밀번호는 bcrypt로 암호화되어 저장됩니다
2. 이메일은 중복될 수 없습니다
3. JWT 토큰은 Authorization 헤더에 "Bearer {token}" 형식으로 전송해야 합니다
4. 모든 필수 필드는 반드시 포함되어야 합니다
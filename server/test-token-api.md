# 토큰으로 유저 정보 가져오기 API 테스트

## 새로 추가된 엔드포인트들

### 1. 프로필 조회 (기존 개선)
- **URL**: `GET /api/auth/profile`
- **인증**: Bearer Token 필요
- **설명**: JWT 토큰으로 현재 사용자의 상세 정보 조회

### 2. 토큰 유효성 검증
- **URL**: `GET /api/auth/verify-token`
- **인증**: Bearer Token 필요
- **설명**: 토큰이 유효한지 확인하고 기본 사용자 정보 반환

### 3. 현재 사용자 정보 (별칭)
- **URL**: `GET /api/auth/me`
- **인증**: Bearer Token 필요
- **설명**: `/profile`과 동일한 기능 (REST API 관례)

## 테스트 방법

### 1단계: 로그인하여 토큰 받기
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 2단계: 받은 토큰으로 유저 정보 조회
```bash
# 프로필 조회
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"

# 토큰 검증
curl -X GET http://localhost:5000/api/auth/verify-token \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"

# 현재 사용자 정보 (별칭)
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## 예상 응답

### 프로필 조회 응답
```json
{
  "success": true,
  "message": "사용자 정보 조회 성공",
  "data": {
    "user": {
      "_id": "user_id_here",
      "name": "사용자 이름",
      "email": "user@example.com",
      "user_type": "customer",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 토큰 검증 응답
```json
{
  "success": true,
  "message": "토큰이 유효합니다",
  "data": {
    "userId": "user_id_here",
    "email": "user@example.com",
    "name": "사용자 이름",
    "user_type": "customer"
  }
}
```

## 오류 응답

### 토큰 없음
```json
{
  "success": false,
  "message": "접근 권한이 없습니다. 로그인이 필요합니다."
}
```

### 유효하지 않은 토큰
```json
{
  "success": false,
  "message": "유효하지 않은 토큰입니다."
}
```
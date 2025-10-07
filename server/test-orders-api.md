# 주문 API 테스트 가이드

## 기본 정보
- Base URL: `http://localhost:5000/api/orders`
- 모든 요청에는 Authorization 헤더가 필요합니다: `Bearer <token>`

## 1. 주문 생성 (POST /)

장바구니의 상품들을 주문으로 변환합니다.

```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "shipping": {
      "recipientName": "홍길동",
      "phone": "010-1234-5678",
      "zipCode": "12345",
      "address": "서울시 강남구 테헤란로 123",
      "detailAddress": "456호",
      "instructions": "문 앞에 놓아주세요"
    },
    "payment": {
      "method": "credit_card"
    },
    "discount": 5000
  }'
```

### Creem 결제 예시
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "shipping": {
      "recipientName": "홍길동",
      "phone": "010-1234-5678",
      "zipCode": "12345",
      "address": "서울시 강남구 테헤란로 123",
      "detailAddress": "456호"
    },
    "payment": {
      "method": "creem",
      "creemInfo": {
        "creemUserId": "creem_user_123",
        "paymentToken": "creem_token_abc123",
        "usedAmount": 15000
      }
    }
  }'
```

## 2. 내 주문 목록 조회 (GET /my-orders)

```bash
curl -X GET "http://localhost:5000/api/orders/my-orders?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 3. 주문 상세 조회 (GET /:orderId)

```bash
curl -X GET http://localhost:5000/api/orders/ORDER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 4. 주문 취소 (PATCH /:orderId/cancel)

```bash
curl -X PATCH http://localhost:5000/api/orders/ORDER_ID/cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "reason": "단순 변심"
  }'
```

## 관리자 전용 API

### 5. 모든 주문 조회 (GET /admin/all)

```bash
curl -X GET "http://localhost:5000/api/orders/admin/all?page=1&limit=20&status=order_confirmed" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### 6. 주문 상태 업데이트 (PATCH /admin/:orderId/status)

```bash
curl -X PATCH http://localhost:5000/api/orders/admin/ORDER_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "status": "shipping_started",
    "adminNotes": "CJ대한통운으로 발송 완료",
    "tracking": {
      "carrier": "CJ대한통운",
      "trackingNumber": "123456789012",
      "estimatedDelivery": "2024-12-03T00:00:00.000Z"
    }
  }'
```

### 7. 주문 통계 조회 (GET /admin/stats)

```bash
curl -X GET http://localhost:5000/api/orders/admin/stats \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

## 주문 상태 값

- `order_confirmed`: 주문 확인
- `preparing`: 상품 준비중
- `shipping_started`: 배송 시작
- `in_delivery`: 배송중
- `delivered`: 배송 완료
- `cancelled`: 주문 취소

## 결제 방식 값

- `credit_card`: 신용카드
- `bank_transfer`: 계좌이체
- `kakao_pay`: 카카오페이
- `naver_pay`: 네이버페이
- `creem`: Creem

## 결제 상태 값

- `pending`: 결제 대기
- `completed`: 결제 완료
- `failed`: 결제 실패
- `cancelled`: 결제 취소
- `refunded`: 환불 완료

## 테스트 시나리오

### 1. 기본 주문 플로우
1. 장바구니에 상품 추가
2. 주문 생성 (POST /)
3. 주문 상세 조회 (GET /:orderId)
4. 관리자가 주문 상태 업데이트 (PATCH /admin/:orderId/status)

### 2. 주문 취소 플로우
1. 주문 생성
2. 주문 취소 (PATCH /:orderId/cancel)
3. 재고 복구 확인

### 3. Creem 결제 플로우
1. Creem 결제 정보와 함께 주문 생성
2. 주문 상세에서 Creem 정보 확인

## 에러 케이스

### 장바구니가 비어있는 경우
```json
{
  "success": false,
  "message": "장바구니가 비어있습니다."
}
```

### 재고 부족인 경우
```json
{
  "success": false,
  "message": "상품명 상품의 재고가 부족합니다. (재고: 5개)"
}
```

### 이미 배송 시작된 주문 취소 시도
```json
{
  "success": false,
  "message": "이미 배송이 시작된 주문은 취소할 수 없습니다."
}
```
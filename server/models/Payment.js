const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // 연결된 주문
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, '주문 정보가 필요합니다'],
    unique: true
  },
  
  // 결제 고유 번호
  paymentNumber: {
    type: String,
    unique: true,
    required: true,
    uppercase: true
  },
  
  // 결제 금액 정보
  amount: {
    // 원래 주문 금액
    original: {
      type: Number,
      required: [true, '원래 주문 금액을 입력해주세요'],
      min: [0, '주문 금액은 0보다 작을 수 없습니다']
    },
    // 할인 금액
    discount: {
      type: Number,
      default: 0,
      min: [0, '할인 금액은 0보다 작을 수 없습니다']
    },
    // 세금
    tax: {
      type: Number,
      default: 0,
      min: [0, '세금은 0보다 작을 수 없습니다']
    },
    // 배송비
    shipping: {
      type: Number,
      default: 0,
      min: [0, '배송비는 0보다 작을 수 없습니다']
    },
    // 최종 결제 금액
    final: {
      type: Number,
      required: [true, '최종 결제 금액을 입력해주세요'],
      min: [0, '최종 결제 금액은 0보다 작을 수 없습니다']
    },
    // 통화
    currency: {
      type: String,
      default: 'KRW',
      enum: ['KRW', 'USD', 'EUR', 'JPY']
    }
  },
  
  // 결제 방법
  method: {
    type: {
      type: String,
      required: [true, '결제 방법을 선택해주세요'],
      enum: ['card', 'bank_transfer', 'virtual_account', 'mobile', 'kakao_pay', 'naver_pay', 'paypal']
    },
    // 카드 결제 정보
    card: {
      company: String, // 카드사
      number: String, // 마스킹된 카드번호 (예: **** **** **** 1234)
      type: {
        type: String,
        enum: ['credit', 'debit', 'prepaid']
      },
      installment: {
        type: Number,
        default: 0, // 0: 일시불, 2~12: 할부 개월
        min: 0,
        max: 12
      }
    },
    // 계좌이체 정보
    bankTransfer: {
      bankName: String,
      accountNumber: String, // 마스킹된 계좌번호
      holderName: String
    },
    // 가상계좌 정보
    virtualAccount: {
      bankName: String,
      accountNumber: String,
      holderName: String,
      expireAt: Date // 입금 만료 시간
    }
  },
  
  // 결제 상태
  status: {
    type: String,
    enum: [
      'pending',      // 결제 대기
      'processing',   // 결제 처리중
      'completed',    // 결제 완료
      'failed',       // 결제 실패
      'cancelled',    // 결제 취소
      'refunded',     // 환불 완료
      'partial_refunded' // 부분 환불
    ],
    default: 'pending'
  },
  
  // 결제 게이트웨이 정보
  gateway: {
    // 결제 서비스 제공업체
    provider: {
      type: String,
      required: [true, '결제 서비스 제공업체를 입력해주세요'],
      enum: ['toss', 'kakao', 'naver', 'paypal', 'stripe', 'iamport', 'inicis']
    },
    // 거래 ID
    transactionId: {
      type: String,
      required: [true, '거래 ID를 입력해주세요'],
      unique: true
    },
    // 승인 번호
    approvalNumber: String,
    // 결제 키 (토스페이먼츠 등)
    paymentKey: String,
    // 결제 요청 URL
    requestUrl: String,
    // 결제 승인 URL
    approvalUrl: String
  },
  
  // 결제 시간 정보
  timing: {
    // 결제 요청 시간
    requestedAt: {
      type: Date,
      default: Date.now
    },
    // 결제 승인 시간
    approvedAt: Date,
    // 결제 완료 시간
    completedAt: Date,
    // 결제 만료 시간
    expiresAt: Date
  },
  
  // 환불 정보
  refund: {
    // 환불 가능 금액
    availableAmount: {
      type: Number,
      default: function() { return this.amount.final; }
    },
    // 환불된 금액
    refundedAmount: {
      type: Number,
      default: 0,
      min: [0, '환불 금액은 0보다 작을 수 없습니다']
    },
    // 환불 이력
    history: [{
      amount: {
        type: Number,
        required: true,
        min: [0, '환불 금액은 0보다 작을 수 없습니다']
      },
      reason: {
        type: String,
        required: true,
        maxlength: [500, '환불 사유는 500자를 초과할 수 없습니다']
      },
      requestedAt: {
        type: Date,
        default: Date.now
      },
      processedAt: Date,
      status: {
        type: String,
        enum: ['requested', 'processing', 'completed', 'failed'],
        default: 'requested'
      },
      transactionId: String // 환불 거래 ID
    }]
  },
  
  // 결제 실패 정보
  failure: {
    code: String, // 실패 코드
    message: String, // 실패 메시지
    details: String, // 상세 실패 사유
    retryCount: {
      type: Number,
      default: 0
    },
    lastRetryAt: Date
  },
  
  // 보안 정보
  security: {
    // IP 주소
    ipAddress: String,
    // 사용자 에이전트
    userAgent: String,
    // 결제 인증 방법
    authentication: {
      type: String,
      enum: ['3ds', 'pin', 'biometric', 'otp', 'none'],
      default: 'none'
    },
    // 위험도 점수 (0-100)
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  
  // 영수증 정보
  receipt: {
    // 영수증 번호
    number: String,
    // 영수증 URL
    url: String,
    // 현금영수증 정보
    cashReceipt: {
      requested: {
        type: Boolean,
        default: false
      },
      type: {
        type: String,
        enum: ['personal', 'business'],
        default: 'personal'
      },
      identifier: String, // 휴대폰번호 또는 사업자번호
      approvalNumber: String,
      url: String
    }
  },
  
  // 결제 메모 (관리자용)
  adminNotes: {
    type: String,
    maxlength: [1000, '관리자 메모는 1000자를 초과할 수 없습니다']
  }
}, {
  timestamps: true
});

// 인덱스 설정
paymentSchema.index({ order: 1 }, { unique: true });
paymentSchema.index({ paymentNumber: 1 }, { unique: true });
paymentSchema.index({ 'gateway.transactionId': 1 }, { unique: true });
paymentSchema.index({ status: 1 });
paymentSchema.index({ 'method.type': 1 });
paymentSchema.index({ 'gateway.provider': 1 });
paymentSchema.index({ 'timing.requestedAt': -1 });

// 결제 번호 자동 생성 미들웨어
paymentSchema.pre('save', async function(next) {
  if (this.isNew && !this.paymentNumber) {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    // 오늘 날짜의 결제 개수 조회
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    
    const todayPaymentCount = await this.constructor.countDocuments({
      createdAt: { $gte: todayStart, $lt: todayEnd }
    });
    
    // 결제번호 생성: PAY + 날짜 + 순번 (예: PAY20241201001)
    this.paymentNumber = `PAY${dateStr}${String(todayPaymentCount + 1).padStart(3, '0')}`;
  }
  next();
});

// 최종 결제 금액 계산 미들웨어
paymentSchema.pre('save', function(next) {
  if (this.isModified('amount')) {
    this.amount.final = this.amount.original - this.amount.discount + this.amount.tax + this.amount.shipping;
  }
  next();
});

// 가상 필드: 환불 가능 여부
paymentSchema.virtual('canRefund').get(function() {
  return this.status === 'completed' && this.refund.availableAmount > 0;
});

// 가상 필드: 결제 완료 여부
paymentSchema.virtual('isCompleted').get(function() {
  return this.status === 'completed';
});

// 가상 필드: 결제 소요 시간 (분)
paymentSchema.virtual('processingTime').get(function() {
  if (this.timing.completedAt && this.timing.requestedAt) {
    const diffTime = this.timing.completedAt - this.timing.requestedAt;
    return Math.round(diffTime / (1000 * 60)); // 분 단위
  }
  return null;
});

// JSON 변환 시 가상 필드 포함
paymentSchema.set('toJSON', { virtuals: true });

// 결제 승인 메서드
paymentSchema.methods.approve = function(approvalNumber, paymentKey) {
  this.status = 'completed';
  this.gateway.approvalNumber = approvalNumber;
  this.gateway.paymentKey = paymentKey;
  this.timing.approvedAt = new Date();
  this.timing.completedAt = new Date();
  this.refund.availableAmount = this.amount.final;
};

// 결제 실패 처리 메서드
paymentSchema.methods.fail = function(code, message, details) {
  this.status = 'failed';
  this.failure.code = code;
  this.failure.message = message;
  this.failure.details = details;
  this.failure.retryCount += 1;
  this.failure.lastRetryAt = new Date();
};

// 환불 요청 메서드
paymentSchema.methods.requestRefund = function(amount, reason) {
  if (amount > this.refund.availableAmount) {
    throw new Error('환불 요청 금액이 환불 가능 금액을 초과합니다.');
  }
  
  this.refund.history.push({
    amount: amount,
    reason: reason,
    requestedAt: new Date(),
    status: 'requested'
  });
  
  return this.refund.history[this.refund.history.length - 1];
};

// 환불 완료 처리 메서드
paymentSchema.methods.completeRefund = function(refundId, transactionId) {
  const refundItem = this.refund.history.id(refundId);
  if (refundItem) {
    refundItem.status = 'completed';
    refundItem.processedAt = new Date();
    refundItem.transactionId = transactionId;
    
    this.refund.refundedAmount += refundItem.amount;
    this.refund.availableAmount -= refundItem.amount;
    
    // 전액 환불 시 상태 변경
    if (this.refund.availableAmount === 0) {
      this.status = 'refunded';
    } else {
      this.status = 'partial_refunded';
    }
  }
};

module.exports = mongoose.model('Payment', paymentSchema);
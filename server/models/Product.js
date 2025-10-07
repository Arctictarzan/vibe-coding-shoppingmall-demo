const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: [true, 'SKU를 입력해주세요'],
    unique: true,
    trim: true,
    uppercase: true, // SKU는 대문자로 저장
    validate: {
      validator: function(v) {
        // SKU 형식 검증: 영문자, 숫자, 하이픈만 허용 (3-20자)
        // 예: PRD-001, TOP001, SHIRT-L-001, ABC123 등
        return /^[A-Z0-9\-]{3,20}$/.test(v) && 
               !/^[\-]|[\-]$/.test(v) && // 시작이나 끝에 하이픈 불가
               !/[\-]{2,}/.test(v); // 연속된 하이픈 불가
      },
      message: 'SKU는 영문자, 숫자, 하이픈만 사용 가능하며 3-20자여야 합니다 (예: PRD-001, TOP001, SHIRT-L-001)'
    }
  },
  name: {
    type: String,
    required: [true, '상품명을 입력해주세요'],
    trim: true,
    maxlength: [100, '상품명은 100자를 초과할 수 없습니다']
  },
  price: {
    type: Number,
    required: [true, '가격을 입력해주세요'],
    min: [0, '가격은 0보다 작을 수 없습니다']
  },
  category: {
    type: String,
    required: [true, '카테고리를 선택해주세요'],
    enum: {
      values: ['tops', 'bottoms', 'accessories'],
      message: '카테고리는 tops, bottoms, accessories 중 하나여야 합니다'
    }
  },
  image: {
    url: {
      type: String,
      required: [true, '상품 이미지를 업로드해주세요'],
      validate: {
        validator: function(v) {
          // Cloudinary URL 형식 검증
          return /^https:\/\/res\.cloudinary\.com\//.test(v) || /^https?:\/\//.test(v);
        },
        message: '유효한 이미지 URL을 입력해주세요'
      }
    },
    publicId: {
      type: String, // Cloudinary public_id 저장 (삭제 시 필요)
      default: null
    },
    alt: {
      type: String,
      default: function() {
        return this.name || '상품 이미지';
      }
    }
  },
  description: {
    type: String,
    required: false, // 필수값 아님
    maxlength: [2000, '상품 설명은 2000자를 초과할 수 없습니다'],
    default: ''
  },
  // 추가 필드들 (기존 기능 유지)
  originalPrice: {
    type: Number,
    min: [0, '원가는 0보다 작을 수 없습니다']
  },
  stock: {
    type: Number,
    required: [true, '재고 수량을 입력해주세요'],
    min: [0, '재고는 0보다 작을 수 없습니다'],
    default: 0
  },
  brand: {
    type: String,
    trim: true
  },
  specifications: {
    type: Map,
    of: String
  },
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  sales: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// 인덱스 설정
productSchema.index({ sku: 1 }, { unique: true }); // SKU 유니크 인덱스
productSchema.index({ name: 'text', description: 'text' }); // 텍스트 검색용
productSchema.index({ category: 1, price: 1 }); // 카테고리별 가격 정렬용
productSchema.index({ createdAt: -1 }); // 최신순 정렬용
productSchema.index({ 'rating.average': -1 }); // 평점순 정렬용
productSchema.index({ isActive: 1 }); // 활성 상품 필터링용

// SKU 자동 생성 미들웨어 (선택사항)
productSchema.pre('save', async function(next) {
  if (this.isNew && !this.sku) {
    // SKU가 없으면 자동 생성
    const categoryPrefix = {
      '상의': 'TOP',
      '하의': 'BTM',
      '악세사리': 'ACC'
    };
    
    const prefix = categoryPrefix[this.category] || 'PRD';
    const count = await this.constructor.countDocuments({ category: this.category });
    this.sku = `${prefix}-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

// 가상 필드: 할인율
productSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// 가상 필드: 재고 상태
productSchema.virtual('stockStatus').get(function() {
  if (this.stock === 0) return 'out_of_stock';
  if (this.stock <= 10) return 'low_stock';
  return 'in_stock';
});

// 가상 필드: 카테고리 영문명 (API 호환성)
productSchema.virtual('categoryEn').get(function() {
  const categoryMap = {
    '상의': 'tops',
    '하의': 'bottoms',
    '악세사리': 'accessories'
  };
  return categoryMap[this.category] || 'others';
});

// JSON 변환 시 가상 필드 포함
productSchema.set('toJSON', { virtuals: true });

// 스키마 메서드: SKU 중복 확인
productSchema.statics.isSkuUnique = async function(sku, excludeId = null) {
  const query = { sku: sku.toUpperCase() };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  const existing = await this.findOne(query);
  return !existing;
};

// 스키마 메서드: 다음 SKU 생성
productSchema.statics.generateNextSku = async function(category) {
  const categoryPrefix = {
    '상의': 'TOP',
    '하의': 'BTM',
    '악세사리': 'ACC'
  };
  
  const prefix = categoryPrefix[category] || 'PRD';
  const count = await this.countDocuments({ category });
  return `${prefix}-${String(count + 1).padStart(3, '0')}`;
};

module.exports = mongoose.model('Product', productSchema);
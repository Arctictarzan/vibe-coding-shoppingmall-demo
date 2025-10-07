const Product = require('../models/Product');

// 모든 상품 조회 (공개)
const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 5,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      minPrice,
      maxPrice,
      isActive = true
    } = req.query;

    // 필터 조건 구성
    const filter = { isActive };
    
    if (category) {
      filter.category = category;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // 정렬 옵션
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // 페이지네이션
    const skip = (page - 1) * limit;

    const products = await Product.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .select('-__v');

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: Number(limit)
        }
      }
    });
  } catch (error) {
    console.error('상품 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '상품 목록을 불러오는데 실패했습니다.',
      error: error.message
    });
  }
};

// 특정 상품 조회 (공개)
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select('-__v');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('상품 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '상품을 불러오는데 실패했습니다.',
      error: error.message
    });
  }
};

// SKU로 상품 조회 (공개)
const getProductBySku = async (req, res) => {
  try {
    const product = await Product.findOne({ sku: req.params.sku.toUpperCase() }).select('-__v');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('상품 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '상품을 불러오는데 실패했습니다.',
      error: error.message
    });
  }
};

// 상품 생성 (관리자만)
const createProduct = async (req, res) => {
  try {
    // 관리자 권한 확인
    if (req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '관리자만 상품을 등록할 수 있습니다.'
      });
    }

    // 받은 데이터 로깅
    console.log('🔍 상품 등록 요청 데이터:', JSON.stringify(req.body, null, 2));
    console.log('🔍 카테고리 값:', req.body.category);
    console.log('🔍 카테고리 타입:', typeof req.body.category);
    console.log('🔍 카테고리 길이:', req.body.category?.length);

    const {
      sku,
      name,
      price,
      category,
      image,
      description,
      originalPrice,
      stock = 0,
      brand,
      specifications,
      tags,
      isActive = true,
      isFeatured = false
    } = req.body;

    // 필수 필드 검증
    if (!name || !price || !category || !image?.url) {
      return res.status(400).json({
        success: false,
        message: '상품명, 가격, 카테고리, 이미지는 필수 입력 항목입니다.'
      });
    }

    // SKU 중복 확인 (제공된 경우)
    if (sku) {
      const isUnique = await Product.isSkuUnique(sku);
      if (!isUnique) {
        return res.status(400).json({
          success: false,
          message: '이미 존재하는 SKU입니다.'
        });
      }
    }

    // 상품 생성
    const productData = {
      name,
      price: Number(price),
      category,
      image: {
        url: image.url,
        publicId: image.publicId || null,
        alt: image.alt || name
      },
      description: description || '',
      stock: Number(stock),
      isActive,
      isFeatured
    };

    // 선택적 필드 추가
    if (sku) productData.sku = sku.toUpperCase();
    if (originalPrice) productData.originalPrice = Number(originalPrice);
    if (brand) productData.brand = brand;
    if (specifications) productData.specifications = specifications;
    if (tags && Array.isArray(tags)) productData.tags = tags;

    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      success: true,
      message: '상품이 성공적으로 등록되었습니다.',
      data: product
    });
  } catch (error) {
    console.error('상품 생성 오류:', error);
    
    // MongoDB 중복 키 오류 처리
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'SKU가 이미 존재합니다.'
      });
    }
    
    // Validation 오류 처리
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: '입력 데이터가 올바르지 않습니다.',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: '상품 등록에 실패했습니다.',
      error: error.message
    });
  }
};

// 상품 수정 (관리자만)
const updateProduct = async (req, res) => {
  try {
    // 관리자 권한 확인
    if (req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '관리자만 상품을 수정할 수 있습니다.'
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다.'
      });
    }

    const {
      sku,
      name,
      price,
      category,
      image,
      description,
      originalPrice,
      stock,
      brand,
      specifications,
      tags,
      isActive,
      isFeatured
    } = req.body;

    // SKU 중복 확인 (변경된 경우)
    if (sku && sku !== product.sku) {
      const isUnique = await Product.isSkuUnique(sku, product._id);
      if (!isUnique) {
        return res.status(400).json({
          success: false,
          message: '이미 존재하는 SKU입니다.'
        });
      }
    }

    // 업데이트할 필드들
    const updateData = {};
    if (sku !== undefined) updateData.sku = sku.toUpperCase();
    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = Number(price);
    if (category !== undefined) updateData.category = category;
    if (image !== undefined) updateData.image = image;
    if (description !== undefined) updateData.description = description;
    if (originalPrice !== undefined) updateData.originalPrice = Number(originalPrice);
    if (stock !== undefined) updateData.stock = Number(stock);
    if (brand !== undefined) updateData.brand = brand;
    if (specifications !== undefined) updateData.specifications = specifications;
    if (tags !== undefined) updateData.tags = tags;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: '상품이 성공적으로 수정되었습니다.',
      data: updatedProduct
    });
  } catch (error) {
    console.error('상품 수정 오류:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'SKU가 이미 존재합니다.'
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: '입력 데이터가 올바르지 않습니다.',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: '상품 수정에 실패했습니다.',
      error: error.message
    });
  }
};

// 상품 삭제 (관리자만)
const deleteProduct = async (req, res) => {
  try {
    // 관리자 권한 확인
    if (req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '관리자만 상품을 삭제할 수 있습니다.'
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다.'
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: '상품이 성공적으로 삭제되었습니다.',
      data: { deletedProduct: product }
    });
  } catch (error) {
    console.error('상품 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '상품 삭제에 실패했습니다.',
      error: error.message
    });
  }
};

// 카테고리별 상품 수 조회 (공개)
const getCategoryStats = async (req, res) => {
  try {
    const stats = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('카테고리 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '카테고리 통계를 불러오는데 실패했습니다.',
      error: error.message
    });
  }
};

// 다음 SKU 생성 (관리자만)
const getNextSku = async (req, res) => {
  try {
    if (req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '관리자만 접근할 수 있습니다.'
      });
    }

    const { category } = req.params;
    const nextSku = await Product.generateNextSku(category);

    res.json({
      success: true,
      data: { nextSku }
    });
  } catch (error) {
    console.error('SKU 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: 'SKU 생성에 실패했습니다.',
      error: error.message
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getProductBySku,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategoryStats,
  getNextSku
};
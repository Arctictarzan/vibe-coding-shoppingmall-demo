const Cart = require('../models/Cart');
const Product = require('../models/Product');

// 현재 사용자의 장바구니 조회
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: 'items.product',
        select: 'name price originalPrice sku image category stock isActive'
      });

    // 장바구니가 없으면 빈 장바구니 생성
    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        items: [],
        totalAmount: 0,
        totalItems: 0
      });
      await cart.save();
    }

    // 비활성화된 상품이나 재고가 없는 상품 필터링
    const validItems = cart.items.filter(item => {
      return item.product && 
             item.product.isActive && 
             item.product.stock > 0;
    });

    // 유효하지 않은 아이템이 있으면 장바구니 업데이트
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    res.json({
      success: true,
      data: cart,
      message: '장바구니를 성공적으로 조회했습니다.'
    });
  } catch (error) {
    console.error('장바구니 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '장바구니 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 장바구니에 상품 추가
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, selectedOptions = {} } = req.body;

    // 입력 검증
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: '상품 ID가 필요합니다.'
      });
    }

    if (quantity < 1 || quantity > 99) {
      return res.status(400).json({
        success: false,
        message: '수량은 1개 이상 99개 이하여야 합니다.'
      });
    }

    // 상품 존재 및 재고 확인
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다.'
      });
    }

    if (!product.isActive) {
      return res.status(400).json({
        success: false,
        message: '현재 판매하지 않는 상품입니다.'
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `재고가 부족합니다. (현재 재고: ${product.stock}개)`
      });
    }

    // 사용자의 장바구니 조회 또는 생성
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        items: [],
        totalAmount: 0,
        totalItems: 0
      });
    }

    // 동일한 상품과 옵션이 이미 장바구니에 있는지 확인
    const existingItemIndex = cart.items.findIndex(item => {
      const productMatch = item.product.toString() === productId;
      const colorMatch = item.selectedOptions.color === selectedOptions.color;
      const sizeMatch = item.selectedOptions.size === selectedOptions.size;
      return productMatch && colorMatch && sizeMatch;
    });

    if (existingItemIndex > -1) {
      // 기존 아이템 수량 업데이트
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      
      if (newQuantity > 99) {
        return res.status(400).json({
          success: false,
          message: '장바구니에 담을 수 있는 최대 수량은 99개입니다.'
        });
      }

      if (product.stock < newQuantity) {
        return res.status(400).json({
          success: false,
          message: `재고가 부족합니다. (현재 재고: ${product.stock}개, 장바구니: ${cart.items[existingItemIndex].quantity}개)`
        });
      }

      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // 새 아이템 추가
      cart.items.push({
        product: productId,
        quantity,
        selectedOptions,
        priceAtAdd: product.price
      });
    }

    await cart.save();

    // 업데이트된 장바구니 조회 (populate 포함)
    cart = await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: 'name price originalPrice sku image category stock isActive'
      });

    res.status(201).json({
      success: true,
      data: cart,
      message: '상품이 장바구니에 추가되었습니다.'
    });
  } catch (error) {
    console.error('장바구니 추가 오류:', error);
    res.status(500).json({
      success: false,
      message: '장바구니에 상품을 추가하는 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 장바구니 아이템 수량 업데이트
exports.updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    // 입력 검증
    if (!quantity || quantity < 1 || quantity > 99) {
      return res.status(400).json({
        success: false,
        message: '수량은 1개 이상 99개 이하여야 합니다.'
      });
    }

    // 장바구니 조회
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: '장바구니를 찾을 수 없습니다.'
      });
    }

    // 아이템 찾기
    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '장바구니에서 해당 상품을 찾을 수 없습니다.'
      });
    }

    // 상품 재고 확인
    const product = await Product.findById(cart.items[itemIndex].product);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다.'
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `재고가 부족합니다. (현재 재고: ${product.stock}개)`
      });
    }

    // 수량 업데이트
    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    // 업데이트된 장바구니 조회
    const updatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: 'name price originalPrice sku image category stock isActive'
      });

    res.json({
      success: true,
      data: updatedCart,
      message: '수량이 업데이트되었습니다.'
    });
  } catch (error) {
    console.error('장바구니 수량 업데이트 오류:', error);
    res.status(500).json({
      success: false,
      message: '수량 업데이트 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 장바구니에서 특정 아이템 제거
exports.removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    // 장바구니 조회
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: '장바구니를 찾을 수 없습니다.'
      });
    }

    // 아이템 제거
    const initialLength = cart.items.length;
    cart.items = cart.items.filter(item => item._id.toString() !== itemId);

    if (cart.items.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: '장바구니에서 해당 상품을 찾을 수 없습니다.'
      });
    }

    await cart.save();

    // 업데이트된 장바구니 조회
    const updatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: 'name price originalPrice sku image category stock isActive'
      });

    res.json({
      success: true,
      data: updatedCart,
      message: '상품이 장바구니에서 제거되었습니다.'
    });
  } catch (error) {
    console.error('장바구니 아이템 제거 오류:', error);
    res.status(500).json({
      success: false,
      message: '상품 제거 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 장바구니 전체 비우기
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: '장바구니를 찾을 수 없습니다.'
      });
    }

    cart.clearCart();
    await cart.save();

    res.json({
      success: true,
      data: cart,
      message: '장바구니가 비워졌습니다.'
    });
  } catch (error) {
    console.error('장바구니 비우기 오류:', error);
    res.status(500).json({
      success: false,
      message: '장바구니를 비우는 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 장바구니 아이템 개수 조회
exports.getCartCount = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    
    const count = cart ? cart.totalItems : 0;
    const itemCount = cart ? cart.items.length : 0;

    res.json({
      success: true,
      data: {
        totalItems: count,
        itemCount: itemCount
      },
      message: '장바구니 개수를 조회했습니다.'
    });
  } catch (error) {
    console.error('장바구니 개수 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '장바구니 개수 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 장바구니 요약 정보 조회
exports.getCartSummary = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: 'items.product',
        select: 'name price originalPrice stock isActive'
      });

    if (!cart || cart.items.length === 0) {
      return res.json({
        success: true,
        data: {
          totalItems: 0,
          itemCount: 0,
          totalAmount: 0,
          totalOriginalAmount: 0,
          totalDiscount: 0,
          hasOutOfStock: false,
          hasInactiveProducts: false
        },
        message: '빈 장바구니입니다.'
      });
    }

    // 요약 정보 계산
    let totalOriginalAmount = 0;
    let hasOutOfStock = false;
    let hasInactiveProducts = false;

    cart.items.forEach(item => {
      if (item.product) {
        // 원가 계산
        const originalPrice = item.product.originalPrice || item.product.price;
        totalOriginalAmount += originalPrice * item.quantity;

        // 재고 및 활성 상태 확인
        if (item.product.stock < item.quantity) {
          hasOutOfStock = true;
        }
        if (!item.product.isActive) {
          hasInactiveProducts = true;
        }
      }
    });

    const totalDiscount = totalOriginalAmount - cart.totalAmount;

    res.json({
      success: true,
      data: {
        totalItems: cart.totalItems,
        itemCount: cart.items.length,
        totalAmount: cart.totalAmount,
        totalOriginalAmount,
        totalDiscount,
        hasOutOfStock,
        hasInactiveProducts
      },
      message: '장바구니 요약 정보를 조회했습니다.'
    });
  } catch (error) {
    console.error('장바구니 요약 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '장바구니 요약 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 장바구니 유효성 검사
exports.validateCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: 'items.product',
        select: 'name price stock isActive'
      });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: '장바구니가 비어있습니다.'
      });
    }

    const issues = [];
    const validItems = [];

    for (const item of cart.items) {
      if (!item.product) {
        issues.push({
          itemId: item._id,
          issue: 'product_not_found',
          message: '상품을 찾을 수 없습니다.'
        });
        continue;
      }

      if (!item.product.isActive) {
        issues.push({
          itemId: item._id,
          productName: item.product.name,
          issue: 'product_inactive',
          message: '현재 판매하지 않는 상품입니다.'
        });
        continue;
      }

      if (item.product.stock < item.quantity) {
        issues.push({
          itemId: item._id,
          productName: item.product.name,
          issue: 'insufficient_stock',
          message: `재고가 부족합니다. (요청: ${item.quantity}개, 재고: ${item.product.stock}개)`,
          requestedQuantity: item.quantity,
          availableStock: item.product.stock
        });
        continue;
      }

      // 가격 변동 확인
      if (item.priceAtAdd !== item.product.price) {
        issues.push({
          itemId: item._id,
          productName: item.product.name,
          issue: 'price_changed',
          message: '상품 가격이 변경되었습니다.',
          oldPrice: item.priceAtAdd,
          newPrice: item.product.price
        });
      }

      validItems.push(item);
    }

    const isValid = issues.length === 0;

    res.json({
      success: true,
      data: {
        isValid,
        issues,
        validItemsCount: validItems.length,
        totalIssues: issues.length
      },
      message: isValid ? '장바구니가 유효합니다.' : '장바구니에 문제가 있습니다.'
    });
  } catch (error) {
    console.error('장바구니 유효성 검사 오류:', error);
    res.status(500).json({
      success: false,
      message: '장바구니 유효성 검사 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};
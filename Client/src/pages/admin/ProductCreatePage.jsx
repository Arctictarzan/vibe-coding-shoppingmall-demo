import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { productAPI } from '../../services/api';

// Styled Components
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: 100vh;
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 2rem;
  text-align: center;
  font-size: 2rem;
  font-weight: 600;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  background-color: white;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const ImageUploadSection = styled.div`
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  background-color: #fafafa;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    border-color: #007bff;
    background-color: #f0f8ff;
  }
`;

const ImagePreview = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
`;

const ImagePreviewItem = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #ddd;
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(220, 53, 69, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;

  &:hover {
    background: rgba(220, 53, 69, 1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
`;

const Button = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'variant',
})`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  ${props => props.variant === 'primary' ? `
    background-color: #007bff;
    color: white;
    &:hover {
      background-color: #0056b3;
    }
  ` : `
    background-color: #6c757d;
    color: white;
    &:hover {
      background-color: #545b62;
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 6px;
  padding: 0.75rem;
  margin-bottom: 1rem;
`;

const SuccessMessage = styled.div`
  color: #155724;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 6px;
  padding: 0.75rem;
  margin-bottom: 1rem;
`;

const ProductCreatePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    originalPrice: '',
    category: '',
    description: '',
    stock: '',
    isActive: true,
    isFeatured: false
  });

  const [images, setImages] = useState([]);

  // Cloudinary 위젯 초기화
  useEffect(() => {
    // Cloudinary 스크립트 로드
    if (!window.cloudinary) {
      const script = document.createElement('script');
      script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  // 수정 모드일 때 기존 상품 데이터 로드
  useEffect(() => {
    if (isEditMode && id) {
      const loadProduct = async () => {
        try {
          setLoading(true);
          console.log('상품 로드 시작, ID:', id);
          const response = await productAPI.getProduct(id);
          console.log('API 응답:', response.data);
          const product = response.data.data || response.data;
          
          setFormData({
            name: product.name || '',
            sku: product.sku || '',
            price: product.price || '',
            originalPrice: product.originalPrice || '',
            category: product.category || '',
            description: product.description || '',
            stock: product.stock || '',
            isActive: product.isActive !== undefined ? product.isActive : true,
            isFeatured: product.isFeatured !== undefined ? product.isFeatured : false
          });
          
          console.log('상품 이미지 데이터:', product.image);
          if (product.image) {
            // 서버에서는 image (단수)로 저장되므로 배열로 변환
            if (Array.isArray(product.image)) {
              setImages(product.image);
            } else {
              setImages([product.image]);
            }
          }
        } catch (error) {
          console.error('상품 로드 실패:', error);
          console.error('에러 상세:', error.response?.data || error.message);
          setError(`상품 정보를 불러오는데 실패했습니다: ${error.response?.data?.message || error.message}`);
        } finally {
          setLoading(false);
        }
      };
      
      loadProduct();
    }
  }, [isEditMode, id]);

  // 입력값 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Cloudinary 위젯 열기
  const openCloudinaryWidget = () => {
    if (!window.cloudinary) {
      alert('Cloudinary 위젯이 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
        uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
        multiple: true,
        maxFiles: 5,
        resourceType: 'image',
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        maxFileSize: 5000000, // 5MB
        folder: 'products',
        sources: ['local', 'url', 'camera'],
        showAdvancedOptions: false,
        cropping: true,
        croppingAspectRatio: 1,
        croppingShowDimensions: true,
        theme: 'minimal'
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary 업로드 오류:', error);
          setError('이미지 업로드 중 오류가 발생했습니다.');
          return;
        }

        if (result.event === 'success') {
          const newImage = {
            url: result.info.secure_url,
            publicId: result.info.public_id,
            alt: formData.name || '상품 이미지'
          };
          
          setImages(prev => [...prev, newImage]);
          setError('');
        }
      }
    );

    widget.open();
  };

  // 이미지 제거
  const removeImage = (indexToRemove) => {
    setImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // 폼 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // 유효성 검사
      if (!formData.name.trim()) {
        throw new Error('상품명을 입력해주세요.');
      }
      if (!formData.price || parseFloat(formData.price) <= 0) {
        throw new Error('올바른 가격을 입력해주세요.');
      }
      if (!formData.category) {
        throw new Error('카테고리를 선택해주세요.');
      }
      if (!formData.stock || parseInt(formData.stock) < 0) {
        throw new Error('올바른 재고 수량을 입력해주세요.');
      }
      
      // 이미지 검증 (신규 등록 시에만 필수)
      if (!isEditMode && images.length === 0) {
        throw new Error('최소 1개의 상품 이미지를 업로드해주세요.');
      }

      // SKU 자동 생성 (비어있는 경우)
      let sku = formData.sku;
      if (!sku.trim()) {
        const categoryMap = {
          '상의': 'TOP',
          '하의': 'BTM',
          '악세사리': 'ACC'
        };
        const prefix = categoryMap[formData.category] || 'PRD';
        const randomNum = Math.floor(Math.random() * 900) + 100;
        sku = `${prefix}-${randomNum}`;
      }

      // 카테고리 매핑 (한글 -> 영어)
      const categoryMapping = {
        '상의': 'tops',
        '하의': 'bottoms', 
        '악세사리': 'accessories'
      };

      // 이미지 데이터 처리
      const imageData = images.length > 0 ? images[0] : null;
      const additionalImagesData = images.length > 1 ? images.slice(1) : [];

      // 상품 데이터 준비
      const productData = {
        ...formData,
        sku,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        category: categoryMapping[formData.category] || formData.category,
        stock: parseInt(formData.stock),
        ...(imageData && { image: imageData }),
        ...(additionalImagesData.length > 0 && { additionalImages: additionalImagesData })
      };

      // API 호출
      console.log('상품 등록 데이터:', productData);
      console.log('🔍 클라이언트 카테고리 값:', productData.category);
      console.log('🔍 클라이언트 카테고리 타입:', typeof productData.category);
      console.log('🔍 클라이언트 카테고리 길이:', productData.category?.length);
      console.log('🔍 클라이언트 카테고리 인코딩:', encodeURIComponent(productData.category));
      
      let response;
      if (isEditMode) {
        // 수정 모드 - productAPI 사용
        response = await productAPI.updateProduct(id, productData);
      } else {
        // 생성 모드 - productAPI 사용
        response = await productAPI.createProduct(productData);
      }

      setSuccess(`상품이 성공적으로 ${isEditMode ? '수정' : '등록'}되었습니다!`);
      
      // 생성 모드일 때만 폼 초기화
      if (!isEditMode) {
        setFormData({
          name: '',
          sku: '',
          price: '',
          originalPrice: '',
          category: '',
          description: '',
          stock: '',
          isActive: true,
          isFeatured: false
        });
        setImages([]);
      }

      // 3초 후 관리자 페이지로 이동
      setTimeout(() => {
        navigate('/admin');
      }, 3000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <Container>
        <Card>
          <Title>상품 정보 로딩 중...</Title>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>상품 정보를 불러오고 있습니다.</p>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <Card>
        <Title>{isEditMode ? '상품 수정' : '새 상품 등록'}</Title>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <Form onSubmit={handleSubmit}>
          {/* 기본 정보 */}
          <FormGroup>
            <Label htmlFor="name">상품명 *</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="상품명을 입력하세요"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="sku">SKU (선택사항)</Label>
            <Input
              type="text"
              id="sku"
              name="sku"
              value={formData.sku}
              onChange={handleInputChange}
              placeholder="비워두면 자동 생성됩니다"
            />
          </FormGroup>

          {/* 가격 정보 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormGroup>
              <Label htmlFor="price">판매가격 *</Label>
              <Input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                step="0.01"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="originalPrice">원가 (선택사항)</Label>
              <Input
                type="number"
                id="originalPrice"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </FormGroup>
          </div>

          {/* 카테고리 및 재고 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormGroup>
              <Label htmlFor="category">카테고리 *</Label>
              <Select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">카테고리를 선택하세요</option>
                <option value="상의">상의</option>
                <option value="하의">하의</option>
                <option value="악세사리">악세사리</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="stock">재고 수량 *</Label>
              <Input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                required
              />
            </FormGroup>
          </div>

          {/* 상품 설명 */}
          <FormGroup>
            <Label htmlFor="description">상품 설명</Label>
            <TextArea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="상품에 대한 자세한 설명을 입력하세요"
            />
          </FormGroup>

          {/* 이미지 업로드 */}
          <FormGroup>
            <Label>상품 이미지</Label>
            <ImageUploadSection onClick={openCloudinaryWidget}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📷</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                클릭하여 이미지 업로드
              </div>
              <div style={{ color: '#666', fontSize: '0.9rem' }}>
                최대 5개의 이미지를 업로드할 수 있습니다 (각 5MB 이하)
              </div>
            </ImageUploadSection>

            {images.length > 0 && (
              <ImagePreview>
                {images.map((image, index) => (
                  <ImagePreviewItem key={index}>
                    <PreviewImage src={image.url} alt={image.alt} />
                    <RemoveImageButton onClick={() => removeImage(index)}>
                      ×
                    </RemoveImageButton>
                  </ImagePreviewItem>
                ))}
              </ImagePreview>
            )}
          </FormGroup>

          {/* 상품 옵션 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <CheckboxGroup>
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
              />
              <Label htmlFor="isActive">상품 활성화</Label>
            </CheckboxGroup>

            <CheckboxGroup>
              <input
                type="checkbox"
                id="isFeatured"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleInputChange}
              />
              <Label htmlFor="isFeatured">추천 상품</Label>
            </CheckboxGroup>
          </div>

          {/* 버튼 그룹 */}
          <ButtonGroup>
            <Button type="button" onClick={() => navigate('/admin')}>
              취소
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? `${isEditMode ? '수정' : '등록'} 중...` : `상품 ${isEditMode ? '수정' : '등록'}`}
            </Button>
          </ButtonGroup>
        </Form>
      </Card>
    </Container>
  );
};

export default ProductCreatePage;
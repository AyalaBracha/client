// client/src/pages/AddProductPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getCategories, addProduct } from '../services/apiService';
import './AddProductPage.css';

function AddProductPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [productName, setProductName] = useState('');
  const [productImage, setProductImage] = useState('🍎');
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const availableIcons = [
    '🍎', '🍏', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐',
    '🍈', '🍒', '🍑', '🍍', '🥭', '🥝', '🥥', '🍅', '🥑', '🥒',
    '🌶️', '🫑', '🥕', '🌽', '🥦', '🥬', '🥔', '🍆', '🧄', '🧅',
    '🍄', '🥗', '🥖', '🍞', '🥐', '🥯', '🥨', '🥞', '🧇', '🧈',
    '🥮', '🍩', '🍪', '🍰', '🎂', '🧁', '🥧', '🍫', '🍬', '🍭',
    '🍮', '🍯', '🍧', '🍨', '🍦', '🍿', '🥜', '🌰', '🍘', '🍙',
    '🍚', '🍛', '🍜', '🍝', '🍱', '🍣', '🍤', '🍥', '🥟', '🥠',
    '🥡', '🍢', '🍡', '🍗', '🍖', '🥩', '🥓', '🌭', '🍔', '🍟',
    '🍕', '🥪', '🌮', '🌯', '🥙', '🍲', '🥘', '🍳', '🥚', '🧀',
    '🥛', '🧃', '🧉', '🍵', '☕', '🫖', '🥤', '🧋', '🍶', '🍺',
    '🍻', '🍷', '🥂', '🥃', '🍸', '🍹', '🍼'
  ];

  useEffect(() => {
    loadCategories();
    
    const categoryIdFromUrl = searchParams.get('categoryId');
    if (categoryIdFromUrl) {
      setSelectedCategoryId(Number(categoryIdFromUrl));
    }
  }, [searchParams]);

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const data = await getCategories();
      console.log('✅ קטגוריות נטענו:', data);
      setCategories(data);

      if (selectedCategoryId === 0 && data.length > 0) {
        setSelectedCategoryId(data[0].id);
      }
    } catch (error) {
      console.error('❌ שגיאה בטעינת קטגוריות:', error);
      setErrorMessage('שגיאה בטעינת הקטגוריות');
    } finally {
      setLoadingCategories(false);
    }
  };

  const selectIcon = (icon) => {
    setProductImage(icon);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!productName.trim()) {
      setErrorMessage('שם המוצר הוא שדה חובה');
      return;
    }

    if (!selectedCategoryId || selectedCategoryId <= 0) {
      setErrorMessage('יש לבחור קטגוריה');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const productToSend = {
      name: productName,
      image: productImage,
      categoryId: selectedCategoryId,
    };

    console.log('📤 שולח מוצר חדש:', productToSend);

    try {
      const created = await addProduct(productToSend);
      console.log('✅ מוצר נוסף בהצלחה:', created);
      setSuccessMessage('המוצר נוסף בהצלחה!');

      setTimeout(() => {
        navigate(`/products/${selectedCategoryId}`);
      }, 1500);
    } catch (error) {
      console.error('❌ שגיאה בהוספת מוצר:', error);
      setErrorMessage(error.message || 'אירעה שגיאה בהוספת המוצר');
    } finally {
      setLoading(false);
    }
  };

  const cancel = () => {
    if (selectedCategoryId > 0) {
      navigate(`/products/${selectedCategoryId}`);
    } else {
      navigate('/categories');
    }
  };

  return (
    <div className="add-product-container">
      <div className="form-card">
        <h2>➕ הוספת מוצר חדש</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">שם המוצר *</label>
            <input
              type="text"
              id="name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="הזן שם מוצר..."
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">קטגוריה *</label>
            {loadingCategories ? (
              <div className="loading-text">טוען קטגוריות...</div>
            ) : (
              <select
                id="category"
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                disabled={loading}
              >
                <option value={0} disabled>
                  בחר קטגוריה...
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.image} {cat.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="form-group">
            <label>בחר אייקון</label>
            <div className="icon-grid">
              {availableIcons.map((icon) => (
                <div
                  key={icon}
                  className={`icon-option ${
                    productImage === icon ? 'selected' : ''
                  }`}
                  onClick={() => selectIcon(icon)}
                >
                  {icon}
                </div>
              ))}
            </div>
            <div className="selected-icon">
              <span>אייקון נבחר:</span>
              <span className="icon-preview">{productImage}</span>
            </div>
          </div>

          {successMessage && (
            <div className="message success">✅ {successMessage}</div>
          )}

          {errorMessage && (
            <div className="message error">❌ {errorMessage}</div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={cancel}
              disabled={loading}
            >
              ביטול
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={!productName.trim() || loading || selectedCategoryId <= 0}
            >
              {loading ? 'שומר...' : 'הוסף מוצר'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProductPage;
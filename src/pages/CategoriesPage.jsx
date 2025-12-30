// client/src/pages/CategoriesPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories } from '../services/apiService';
import './CategoriesPage.css';

function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    console.log('📥 מתחיל לטעון קטגוריות...');
    setLoading(true);
    setErrorMessage('');

    try {
      const data = await getCategories();
      console.log('✅ קטגוריות נטענו בהצלחה:', data);
      setCategories(data);
    } catch (error) {
      console.error('❌ שגיאה בטעינת קטגוריות:', error);
      setErrorMessage(error.message || 'אירעה שגיאה בטעינת הקטגוריות');
    } finally {
      setLoading(false);
    }
  };

  const selectCategory = (category) => {
    console.log('➡️ נבחרה קטגוריה:', category.name, 'ID:', category.id);
    navigate(`/products/${category.id}`);
  };

  const goToAddCategory = () => {
    console.log('➡️ עובר לעמוד הוספת קטגוריה');
    navigate('/add-category');
  };

  const goToAddProduct = () => {
    console.log('➡️ עובר לעמוד הוספת מוצר');
    navigate('/add-product');
  };

  return (
    <div className="categories-container">
      <div className="header-section">
        <h1>בחר קטגוריות</h1>
        <p className="subtitle">בחר קטגוריה כדי לראות את המוצרים</p>
        <button className="add-category-btn" onClick={goToAddCategory}>
          ➕ הוסף קטגוריה חדשה
        </button>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>טוען קטגוריות...</p>
        </div>
      )}

      {errorMessage && !loading && (
        <div className="error-container">
          <p className="error-message">❌ {errorMessage}</p>
          <button className="retry-btn" onClick={loadCategories}>
            נסה שוב
          </button>
        </div>
      )}

      {!loading && !errorMessage && categories.length === 0 && (
        <div className="empty-container">
          <div className="empty-icon">📁</div>
          <p>אין קטגוריות עדיין</p>
          <button className="add-category-btn" onClick={goToAddCategory}>
            הוסף קטגוריה ראשונה
          </button>
        </div>
      )}

      <div className="add-product-section">
        <button className="add-product-btn" onClick={goToAddProduct}>
          ➕ הוסף מוצר חדש
        </button>
      </div>

      {!loading && !errorMessage && categories.length > 0 && (
        <div className="categories-grid">
          {categories.map((category) => (
            <div
              key={category.id}
              className="category-card"
              onClick={() => selectCategory(category)}
            >
              <div className="category-bg"></div>
              <div className="sparkles">
                <span>✨</span>
                <span>⭐</span>
                <span>💫</span>
                <span>✦</span>
              </div>
              <div className="category-icon">{category.image}</div>
              <h3>{category.name}</h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoriesPage;
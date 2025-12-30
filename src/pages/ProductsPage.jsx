// client/src/pages/ProductsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductsByCategory } from '../services/apiService';
import selectionService from '../services/selectionService';
import './ProductsPage.css';

function ProductsPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedCount, setSelectedCount] = useState(0);

  useEffect(() => {
    loadProducts();
    updateSelectedCount();
  }, [categoryId]);

  const loadProducts = async () => {
    console.log('📥 טוען מוצרים לקטגוריה:', categoryId);
    setLoading(true);
    setErrorMessage('');

    try {
      const data = await getProductsByCategory(categoryId);
      console.log('✅ מוצרים נטענו:', data);
      setProducts(data);
    } catch (error) {
      console.error('❌ שגיאה בטעינת מוצרים:', error);
      setErrorMessage('אירעה שגיאה בטעינת המוצרים');
    } finally {
      setLoading(false);
    }
  };

  const updateSelectedCount = () => {
    setSelectedCount(selectionService.getTotalItems());
  };

  const isSelected = (product) => {
    return selectionService.isProductSelected(product.id);
  };

  const toggleProduct = (product) => {
    console.log('🔄 Toggle מוצר:', product.name, 'ID:', product.id);

    if (isSelected(product)) {
      console.log('❌ מבטל בחירה');
      selectionService.removeProduct(product.id);
    } else {
      console.log('✅ בוחר מוצר');
      selectionService.addProduct(product, 1);
    }

    updateSelectedCount();
  };

  const goBack = () => {
    navigate('/categories');
  };

  const goToSummary = () => {
    console.log('➡️ עובר לסיכום עם', selectedCount, 'מוצרים');
    navigate('/summary');
  };

  return (
    <div className="products-container">
      <div className="header">
        <button className="back-btn" onClick={goBack}>
          ← חזור לקטגוריות
        </button>
        <h1>בחר מוצרים</h1>
        <button
          className="continue-btn"
          onClick={goToSummary}
          disabled={selectedCount === 0}
        >
          המשך ({selectedCount})
        </button>
      </div>

      {loading && <p>טוען מוצרים...</p>}
      
      {errorMessage && <p className="error-message">❌ {errorMessage}</p>}

      <div className="products-grid">
        {products.map((product) => (
          <div
            key={product.id}
            className={`product-card ${isSelected(product) ? 'selected' : ''}`}
            onClick={() => toggleProduct(product)}
          >
            <div className="product-image">{product.image}</div>
            <h3>{product.name}</h3>
            {isSelected(product) && (
              <div className="selection-indicator">✓</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductsPage;